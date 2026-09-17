// Converts API `readings` rows into the exact row shape DataContext.parseCSV
// produces, so the existing Overview/Analysis/Heatmap/Alerts pages can render
// them unchanged regardless of whether the data came from a CSV or the API.
// Thresholds live on the sensor (not per-reading) in this schema, so they're
// passed in and stamped onto every row to match the old per-row high/low shape.
export function transformReadings(readings, sensor) {
  const high = sensor?.high_threshold ?? null;
  const low = sensor?.low_threshold ?? null;

  return readings.map((r, idx) => {
    const date = new Date(r.ts);
    return {
      idx,
      timestamp: date,
      ts: date.getTime(),
      temp: r.value,
      high,
      low,
      status: (r.status || 'NORMAL').toUpperCase(),
      dateStr: date.toLocaleDateString('en-GB'),
      timeStr: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      hour: date.getHours(),
      dayKey: date.toISOString().slice(0, 10),
    };
  });
}
