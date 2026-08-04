import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [sensors, setSensors] = useState([]);
  const [activeSensorId, setActiveSensorId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parseProgress, setParseProgress] = useState(0);

  const activeSensor = useMemo(() => {
    return sensors.find(s => s.id === activeSensorId) || null;
  }, [sensors, activeSensorId]);

  const parseCSV = useCallback((file) => {
    setIsLoading(true);
    setError(null);
    setParseProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().replace(/^"/, '').replace(/"$/, ''),
      complete: (results) => {
        try {
          let type = 'Temperature';
          let unit = '°C';
          let metricName = 'Temperature';

          const rows = results.data
            .map((row, idx) => {
              const normalized = {};
              for (const k in row) {
                normalized[k.trim().replace(/"/g, '')] = typeof row[k] === 'string'
                  ? row[k].trim().replace(/^="/, '').replace(/"$/, '')
                  : row[k];
              }

              const ts = normalized['TimeStamp'] || normalized['timestamp'] || normalized['Timestamp'];
              
              // Detect AirFlow vs Temperature
              let val = parseFloat(normalized['Temperature'] || normalized['temperature']);
              if (isNaN(val)) {
                val = parseFloat(normalized['AirFlow'] || normalized['airflow'] || normalized['Air Flow']);
                if (!isNaN(val)) {
                  type = 'AirFlow';
                  unit = 'L/min';
                  metricName = 'Air Flow';
                }
              }

              const high = parseFloat(normalized['High'] || normalized['high'] || 80);
              const low  = parseFloat(normalized['Low']  || normalized['low']  || 15);
              const status = (normalized['Status'] || normalized['status'] || 'NORMAL').toUpperCase();

              if (!ts || isNaN(val)) return null;

              const date = new Date(ts);
              return {
                idx,
                timestamp: date,
                ts: date.getTime(),
                val,
                temp: val, // Keep `temp` for backward compatibility with older components if any
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

          if (rows.length === 0) {
            throw new Error("No valid data found. Ensure CSV has TimeStamp and Temperature/AirFlow columns.");
          }

          // Compute stats
          const vals = rows.map((r) => r.val);
          const alertRows = rows.filter((r) => r.status !== 'NORMAL');
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          const max = Math.max(...vals);
          const min = Math.min(...vals);
          const variance = vals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / vals.length;
          
          const stats = {
            count: rows.length,
            avg: +avg.toFixed(2),
            max: +max.toFixed(2),
            min: +min.toFixed(2),
            stdDev: +(Math.sqrt(variance)).toFixed(2),
            alertCount: alertRows.length,
            highCount: rows.filter((r) => r.status === 'HIGH').length,
            lowCount: rows.filter((r) => r.status === 'LOW').length,
            normalPct: +((rows.filter(r => r.status === 'NORMAL').length / rows.length) * 100).toFixed(1),
            dateStart: rows[0]?.timestamp,
            dateEnd: rows[rows.length - 1]?.timestamp,
            currentHigh: rows[rows.length - 1]?.high,
            currentLow:  rows[rows.length - 1]?.low,
            lastVal: rows[rows.length - 1]?.val,
            lastStatus: rows[rows.length - 1]?.status,
          };

          const newSensor = {
            id: Date.now().toString(),
            name: file.name.replace('.csv', ''),
            type,
            unit,
            metricName,
            rows,
            stats,
          };

          setSensors(prev => [...prev, newSensor]);
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

  const removeSensor = useCallback((id) => {
    setSensors(prev => prev.filter(s => s.id !== id));
    if (activeSensorId === id) setActiveSensorId(null);
  }, [activeSensorId]);

  const clearData = useCallback(() => {
    setSensors([]);
    setActiveSensorId(null);
    setError(null);
    setParseProgress(0);
  }, []);

  // Map the active sensor's data to the previous API signature for compatibility
  // so existing pages (OverviewPage, etc.) don't need a huge rewrite.
  const legacyContextValue = useMemo(() => {
    if (!activeSensor) {
      return {
        parsedRows: [],
        fileName: '',
        stats: null,
      };
    }
    return {
      parsedRows: activeSensor.rows,
      fileName: activeSensor.name,
      stats: { ...activeSensor.stats, unit: activeSensor.unit, metricName: activeSensor.metricName, type: activeSensor.type },
    };
  }, [activeSensor]);

  return (
    <DataContext.Provider value={{
      sensors, activeSensorId, setActiveSensorId,
      isLoading, error, parseProgress,
      parseCSV, removeSensor, clearData,
      ...legacyContextValue
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
