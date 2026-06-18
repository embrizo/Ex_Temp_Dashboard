import { useData } from '../context/DataContext';
import { useMemo } from 'react';
import { Flame } from 'lucide-react';

// Interpolate a color on a gradient: cold (blue) → normal (green/cyan) → hot (red)
function tempToColor(temp, low, high) {
  const range = high - low;
  const pct = Math.max(0, Math.min(1, (temp - low) / range));
  if (pct < 0.25) return `rgba(59,130,246,${0.3 + pct * 1.5})`;  // blue
  if (pct < 0.5)  return `rgba(6,182,212,${0.5 + pct})`;          // cyan
  if (pct < 0.75) return `rgba(16,185,129,${0.6 + pct * 0.5})`;   // green
  return `rgba(239,68,68,${0.5 + (pct - 0.75) * 2})`;             // red
}

export default function HeatmapPage() {
  const { parsedRows, stats } = useData();

  const high = parsedRows[parsedRows.length - 1]?.high ?? 80;
  const low  = parsedRows[parsedRows.length - 1]?.low  ?? 15;

  // Build a [day × hour] grid
  const { days, grid, hourlyStats } = useMemo(() => {
    const daySet = [...new Set(parsedRows.map(r => r.dayKey))].sort();
    const grid = {}; // grid[day][hour] = {temps[], avg, count}

    daySet.forEach(day => { grid[day] = {}; });
    parsedRows.forEach(r => {
      if (!grid[r.dayKey]) grid[r.dayKey] = {};
      if (!grid[r.dayKey][r.hour]) grid[r.dayKey][r.hour] = { temps: [], alerts: 0 };
      grid[r.dayKey][r.hour].temps.push(r.temp);
      if (r.status !== 'NORMAL') grid[r.dayKey][r.hour].alerts++;
    });

    // Compute per-cell stats
    daySet.forEach(day => {
      for (let h = 0; h < 24; h++) {
        const cell = grid[day][h];
        if (cell && cell.temps.length) {
          cell.avg = +(cell.temps.reduce((a, b) => a + b, 0) / cell.temps.length).toFixed(2);
          cell.max = Math.max(...cell.temps);
          cell.min = Math.min(...cell.temps);
        }
      }
    });

    // Hourly aggregates across all days
    const hourlyStats = Array(24).fill(null).map((_, h) => {
      const all = parsedRows.filter(r => r.hour === h);
      if (!all.length) return { hour: h, avg: null, count: 0, alerts: 0 };
      return {
        hour: h,
        avg: +(all.reduce((a, b) => a + b.temp, 0) / all.length).toFixed(2),
        count: all.length,
        alerts: all.filter(r => r.status !== 'NORMAL').length,
      };
    });

    return { days: daySet, grid, hourlyStats };
  }, [parsedRows]);

  if (!stats) return null;

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
            <Flame size={12} /> Thermal Pattern
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Heat Pattern Map
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', marginTop: 4 }}>
            Temperature intensity across every hour and day in the dataset.
            Each cell represents the average temperature for that hour on that day.
          </p>
        </div>

        {/* Heatmap */}
        <div className="glass-card chart-panel card-glow-amber" style={{ marginBottom: 'var(--space-4)', overflowX: 'auto' }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">Day × Hour Temperature Matrix</div>
              <div className="chart-subtitle">Hover a cell for exact temperature · Color intensity = temperature level</div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
              <span>Cold</span>
              <div style={{ width: 120, height: 10, borderRadius: 5, background: 'linear-gradient(90deg, rgba(59,130,246,0.8), rgba(6,182,212,1), rgba(16,185,129,1), rgba(239,68,68,1))' }} />
              <span>Hot</span>
            </div>
          </div>

          <div style={{ minWidth: 700 }}>
            {/* Hour header */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(24, 1fr)', gap: 2, marginBottom: 6 }}>
              <div />
              {Array(24).fill(0).map((_, h) => (
                <div key={h} style={{ fontSize: 10, textAlign: 'center', color: 'var(--color-text-3)', fontWeight: 600 }}>
                  {String(h).padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Rows */}
            {days.map(day => (
              <div key={day} style={{ display: 'grid', gridTemplateColumns: '80px repeat(24, 1fr)', gap: 2, marginBottom: 2 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-2)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  {day.slice(5)}
                </div>
                {Array(24).fill(0).map((_, h) => {
                  const cell = grid[day]?.[h];
                  if (!cell || !cell.temps?.length) {
                    return (
                      <div key={h} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.02)', borderRadius: 3 }} />
                    );
                  }
                  const color = tempToColor(cell.avg, low, high);
                  const hasAlert = cell.alerts > 0;
                  return (
                    <div
                      key={h}
                      title={`${day} ${String(h).padStart(2,'0')}:00\nAvg: ${cell.avg}°C\nMax: ${cell.max?.toFixed(1)}°\nMin: ${cell.min?.toFixed(1)}°\nAlerts: ${cell.alerts}`}
                      style={{
                        aspectRatio: '1',
                        background: color,
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'transform 120ms ease',
                        outline: hasAlert ? '1.5px solid rgba(239,68,68,0.7)' : 'none',
                        position: 'relative',
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.3)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  );
                })}
              </div>
            ))}

            {/* Hourly averages row */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(24, 1fr)', gap: 2, marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--color-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>Avg</div>
              {hourlyStats.map((h) => (
                <div
                  key={h.hour}
                  title={`Hour ${String(h.hour).padStart(2,'0')}:00\nAvg: ${h.avg}°C\n${h.count} records`}
                  style={{
                    aspectRatio: '1',
                    background: h.avg != null ? tempToColor(h.avg, low, high) : 'rgba(255,255,255,0.02)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '1px solid rgba(6,182,212,0.3)',
                    transition: 'transform 120ms ease',
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.3)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hourly summary table */}
        <div className="glass-card chart-panel">
          <div className="chart-title" style={{ marginBottom: 'var(--space-4)' }}>Hourly Average Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-2)' }}>
            {hourlyStats.map((h) => (
              <div key={h.hour} style={{
                padding: 'var(--space-3)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${h.alerts > 0 ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 600, marginBottom: 2 }}>
                  {String(h.hour).padStart(2, '0')}:00
                </div>
                <div style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: h.avg == null ? 'var(--color-text-3)' :
                    h.avg >= high ? 'var(--color-red)' :
                    h.avg <= low ? 'var(--color-blue-light)' : 'var(--color-cyan)',
                }}>
                  {h.avg != null ? `${h.avg}°` : '—'}
                </div>
                {h.alerts > 0 && (
                  <div style={{ fontSize: 9, color: 'var(--color-red)', fontWeight: 700, marginTop: 2 }}>
                    ⚠ {h.alerts}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
