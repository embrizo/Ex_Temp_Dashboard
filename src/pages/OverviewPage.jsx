import { useData } from '../context/DataContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend, Brush
} from 'recharts';
import { useMemo, useState } from 'react';
import { Thermometer, TrendingUp, TrendingDown, AlertTriangle, Calendar, Download } from 'lucide-react';

const statusColor = (s) => {
  if (s === 'HIGH') return 'var(--color-red)';
  if (s === 'LOW') return 'var(--color-blue-light)';
  return 'var(--color-green)';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', minWidth: 180 }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 4 }}>{d?.timestamp?.toLocaleString('en-GB')}</div>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-cyan)' }}>{d?.temp?.toFixed(2)} °C</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-red)' }}>H: {d?.high}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-blue-light)' }}>L: {d?.low}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: statusColor(d?.status), fontWeight: 700 }}>{d?.status}</span>
      </div>
    </div>
  );
};

export default function OverviewPage() {
  const { parsedRows, stats, fileName } = useData();
  const [dayFilter, setDayFilter] = useState('all');

  // Get unique days
  const days = useMemo(() => {
    const set = [...new Set(parsedRows.map(r => r.dayKey))].sort();
    return set;
  }, [parsedRows]);

  // Filter by day
  const filtered = useMemo(() => {
    if (dayFilter === 'all') return parsedRows;
    return parsedRows.filter(r => r.dayKey === dayFilter);
  }, [parsedRows, dayFilter]);

  // Downsample for chart performance (max 2000 pts)
  const chartData = useMemo(() => {
    if (filtered.length <= 2000) return filtered;
    const step = Math.ceil(filtered.length / 2000);
    return filtered.filter((_, i) => i % step === 0);
  }, [filtered]);

  // Filtered stats
  const fStats = useMemo(() => {
    if (!filtered.length) return null;
    const temps = filtered.map(r => r.temp);
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    const std = Math.sqrt(temps.reduce((a, b) => a + (b - avg) ** 2, 0) / temps.length);
    return {
      avg: +avg.toFixed(2),
      max: +max.toFixed(2),
      min: +min.toFixed(2),
      std: +std.toFixed(2),
      alerts: filtered.filter(r => r.status !== 'NORMAL').length,
      high: filtered.filter(r => r.status === 'HIGH').length,
      low: filtered.filter(r => r.status === 'LOW').length,
      normal: filtered.filter(r => r.status === 'NORMAL').length,
      normalPct: +((filtered.filter(r => r.status === 'NORMAL').length / filtered.length) * 100).toFixed(1),
    };
  }, [filtered]);

  if (!stats) return null;

  const currentHigh = parsedRows[parsedRows.length - 1]?.high;
  const currentLow  = parsedRows[parsedRows.length - 1]?.low;

  // Export CSV
  const exportCSV = () => {
    const header = 'TimeStamp,Temperature,High,Low,Status\n';
    const body = filtered.map(r =>
      `${r.timestamp.toISOString()},${r.temp},${r.high},${r.low},${r.status}`
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DEMO_Export_${dayFilter}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Page header */}
        <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
              <Thermometer size={12} /> Supply Fan K — Temperature Overview
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Overview Dashboard
            </h1>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 4 }}>
              {stats.dateStart?.toLocaleDateString('en-GB')} → {stats.dateEnd?.toLocaleDateString('en-GB')} · {stats.count.toLocaleString()} records
            </div>
          </div>

          {/* Filters */}
          <div className="filter-bar" style={{ margin: 0 }}>
            <select id="day-filter" className="select-input" value={dayFilter} onChange={e => setDayFilter(e.target.value)}>
              <option value="all">All Days</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button id="export-btn" className="btn btn-ghost btn-sm" onClick={exportCSV}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
          {[
            {
              label: 'Current Temperature', icon: <Thermometer size={14} />,
              value: stats.lastTemp?.toFixed(1), unit: '°C',
              color: 'cyan', glowClass: 'card-glow-cyan',
              sub: `Status: ${stats.lastStatus}`,
            },
            {
              label: 'Average Temperature', icon: <TrendingUp size={14} />,
              value: fStats?.avg, unit: '°C',
              color: 'blue', glowClass: 'card-glow-blue',
              sub: `σ = ${fStats?.std} °C`,
            },
            {
              label: 'Max / Min', icon: <TrendingUp size={14} />,
              value: fStats?.max, unit: '°C',
              color: 'red', glowClass: 'card-glow-red',
              sub: `Min: ${fStats?.min} °C`,
            },
            {
              label: 'Alert Events', icon: <AlertTriangle size={14} />,
              value: fStats?.alerts, unit: '',
              color: fStats?.alerts > 0 ? 'red' : 'green',
              glowClass: fStats?.alerts > 0 ? 'card-glow-red' : 'card-glow-green',
              sub: `HIGH: ${fStats?.high}  LOW: ${fStats?.low}`,
            },
            {
              label: 'Normal Operation', icon: <Calendar size={14} />,
              value: fStats?.normalPct, unit: '%',
              color: 'green', glowClass: 'card-glow-green',
              sub: `${fStats?.normal?.toLocaleString()} of ${filtered.length.toLocaleString()} records`,
            },
            {
              label: 'Threshold High', icon: <TrendingUp size={14} />,
              value: currentHigh, unit: '°C',
              color: 'amber', glowClass: 'card-glow-amber',
              sub: `Low threshold: ${currentLow} °C`,
            },
          ].map((kpi, i) => (
            <div key={i} className={`glass-card kpi-card ${kpi.color} ${kpi.glowClass} stagger-child`} style={{ '--i': i }}>
              <div className="kpi-label">
                {kpi.icon} {kpi.label}
              </div>
              <div className="kpi-value" style={{ color: kpi.color === 'cyan' ? 'var(--color-cyan)' : kpi.color === 'red' ? 'var(--color-red)' : kpi.color === 'green' ? 'var(--color-green)' : kpi.color === 'amber' ? 'var(--color-amber)' : 'var(--color-blue-light)' }}>
                {kpi.value}<span className="kpi-unit">{kpi.unit}</span>
              </div>
              <div className="kpi-sub">{kpi.sub}</div>
              <div className="tele-bar" style={{ marginTop: 'var(--space-3)' }}>
                <div className={`tele-bar-fill ${kpi.color}`} style={{ width: kpi.unit === '%' ? `${kpi.value}%` : kpi.unit === '°C' && kpi.label.includes('Avg') ? `${Math.min((kpi.value / 80) * 100, 100)}%` : '60%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Temperature Timeline */}
        <div className="glass-card chart-panel card-glow-cyan" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">Temperature Timeline</div>
              <div className="chart-subtitle">
                {dayFilter === 'all' ? 'Full dataset' : dayFilter} · {filtered.length.toLocaleString()} records
                {filtered.length > 2000 && <span style={{ marginLeft: 8 }}>· (downsampled to 2,000 pts for display)</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: 'var(--color-cyan)', display: 'inline-block' }} /> Temperature</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: 'var(--color-red)', display: 'inline-block', borderBottom: '2px dashed' }} /> High</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: 'var(--color-blue-light)', display: 'inline-block', borderBottom: '2px dashed' }} /> Low</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="ts"
                scale="time"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                stroke="var(--color-text-3)"
                tick={{ fontSize: 11, fill: 'var(--color-text-3)' }}
                tickCount={8}
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="var(--color-text-3)"
                tick={{ fontSize: 11, fill: 'var(--color-text-3)' }}
                tickFormatter={(v) => `${v}°`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={currentHigh} stroke="var(--color-red)" strokeDasharray="5 5" strokeOpacity={0.7} label={{ value: `H: ${currentHigh}°`, fill: 'var(--color-red)', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={currentLow} stroke="var(--color-blue-light)" strokeDasharray="5 5" strokeOpacity={0.7} label={{ value: `L: ${currentLow}°`, fill: 'var(--color-blue-light)', fontSize: 10, position: 'right' }} />
              <Area type="monotone" dataKey="temp" stroke="var(--color-cyan)" strokeWidth={1.5} fill="url(#tempGradient)" dot={false} activeDot={{ r: 4, fill: 'var(--color-cyan)', stroke: '#fff', strokeWidth: 2 }} />
              <Brush dataKey="ts" height={24} stroke="var(--color-border)" fill="var(--color-bg-2)" travellerWidth={6} tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats row */}
        <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
          {[
            { label: 'Minimum', value: fStats?.min, unit: '°C', color: 'var(--color-blue-light)' },
            { label: 'Maximum', value: fStats?.max, unit: '°C', color: 'var(--color-red)' },
            { label: 'Average', value: fStats?.avg, unit: '°C', color: 'var(--color-cyan)' },
            { label: 'Std Dev (σ)', value: fStats?.std, unit: '°C', color: 'var(--color-purple-light)' },
          ].map((s, i) => (
            <div key={i} className="stat-box stagger-child" style={{ '--i': i }}>
              <div className="stat-box-value" style={{ color: s.color }}>{s.value}<span style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text-3)' }}>{s.unit}</span></div>
              <div className="stat-box-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Per-day summary table */}
        <div className="glass-card chart-panel">
          <div className="chart-header">
            <div>
              <div className="chart-title">Daily Summary</div>
              <div className="chart-subtitle">Per-day statistics breakdown</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="alert-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Records</th>
                  <th>Avg °C</th>
                  <th>Min °C</th>
                  <th>Max °C</th>
                  <th>HIGH</th>
                  <th>LOW</th>
                  <th>Normal %</th>
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  const dayRows = parsedRows.filter(r => r.dayKey === day);
                  const temps = dayRows.map(r => r.temp);
                  const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
                  const min = Math.min(...temps).toFixed(1);
                  const max = Math.max(...temps).toFixed(1);
                  const high = dayRows.filter(r => r.status === 'HIGH').length;
                  const low  = dayRows.filter(r => r.status === 'LOW').length;
                  const normalPct = ((dayRows.filter(r => r.status === 'NORMAL').length / dayRows.length) * 100).toFixed(1);
                  return (
                    <tr key={day}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{day}</td>
                      <td>{dayRows.length.toLocaleString()}</td>
                      <td style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>{avg}</td>
                      <td style={{ color: 'var(--color-blue-light)' }}>{min}</td>
                      <td style={{ color: 'var(--color-red)' }}>{max}</td>
                      <td>{high > 0 ? <span className="tag tag-red">{high}</span> : <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                      <td>{low > 0  ? <span className="tag tag-blue">{low}</span>  : <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2, minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${normalPct}%`, background: parseFloat(normalPct) === 100 ? 'var(--color-green)' : 'var(--color-amber)', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: parseFloat(normalPct) === 100 ? 'var(--color-green)' : 'var(--color-amber)', fontWeight: 600, minWidth: 36 }}>{normalPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
