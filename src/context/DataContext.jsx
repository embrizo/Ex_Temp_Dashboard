import React, { createContext, useContext, useState, useCallback } from 'react';
import Papa from 'papaparse';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [rawRows, setRawRows] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parseProgress, setParseProgress] = useState(0);

  const parseCSV = useCallback((file) => {
    setIsLoading(true);
    setError(null);
    setParseProgress(0);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().replace(/^"/, '').replace(/"$/, ''),
      complete: (results) => {
        try {
          const rows = results.data
            .map((row, idx) => {
              // Normalize keys (strip quotes)
              const normalized = {};
              for (const k in row) {
                normalized[k.trim().replace(/"/g, '')] = typeof row[k] === 'string'
                  ? row[k].trim().replace(/^="/, '').replace(/"$/, '')
                  : row[k];
              }

              const ts = normalized['TimeStamp'] || normalized['timestamp'] || normalized['Timestamp'];
              const temp = parseFloat(normalized['Temperature'] || normalized['temperature'] || 0);
              const high = parseFloat(normalized['High'] || normalized['high'] || 80);
              const low  = parseFloat(normalized['Low']  || normalized['low']  || 15);
              const status = (normalized['Status'] || normalized['status'] || 'NORMAL').toUpperCase();

              if (!ts || isNaN(temp)) return null;

              const date = new Date(ts);
              return {
                idx,
                timestamp: date,
                ts: date.getTime(),
                temp,
                high,
                low,
                status,
                dateStr: date.toLocaleDateString('en-GB'),
                timeStr: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                hour: date.getHours(),
                dayKey: date.toISOString().slice(0, 10),
              };
            })
            .filter(Boolean);

          setRawRows(rows);
          setParsedRows(rows);
          setParseProgress(100);
        } catch (e) {
          setError('Failed to parse CSV: ' + e.message);
        }
        setIsLoading(false);
      },
      error: (err) => {
        setError('CSV parse error: ' + err.message);
        setIsLoading(false);
      },
    });
  }, []);

  const clearData = useCallback(() => {
    setRawRows([]);
    setParsedRows([]);
    setFileName('');
    setError(null);
    setParseProgress(0);
  }, []);

  // Derived stats
  const stats = React.useMemo(() => {
    if (!parsedRows.length) return null;
    const temps = parsedRows.map((r) => r.temp);
    const alertRows = parsedRows.filter((r) => r.status !== 'NORMAL');
    const highRows = parsedRows.filter((r) => r.status === 'HIGH');
    const lowRows  = parsedRows.filter((r) => r.status === 'LOW');
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    const variance = temps.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / temps.length;
    const stdDev = Math.sqrt(variance);
    const maxRow = parsedRows[temps.indexOf(max)];
    const minRow = parsedRows[temps.indexOf(min)];

    return {
      count: parsedRows.length,
      avg: +avg.toFixed(2),
      max: +max.toFixed(2),
      min: +min.toFixed(2),
      stdDev: +stdDev.toFixed(2),
      alertCount: alertRows.length,
      highCount: highRows.length,
      lowCount: lowRows.length,
      normalPct: +((parsedRows.filter(r => r.status === 'NORMAL').length / parsedRows.length) * 100).toFixed(1),
      maxRow,
      minRow,
      dateStart: parsedRows[0]?.timestamp,
      dateEnd: parsedRows[parsedRows.length - 1]?.timestamp,
      currentHigh: parsedRows[parsedRows.length - 1]?.high,
      currentLow:  parsedRows[parsedRows.length - 1]?.low,
      lastTemp: parsedRows[parsedRows.length - 1]?.temp,
      lastStatus: parsedRows[parsedRows.length - 1]?.status,
    };
  }, [parsedRows]);

  return (
    <DataContext.Provider value={{
      rawRows, parsedRows, setParsedRows,
      fileName, isLoading, error, parseProgress,
      parseCSV, clearData, stats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
