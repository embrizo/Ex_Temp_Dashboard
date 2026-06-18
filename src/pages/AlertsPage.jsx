import { useData } from '../context/DataContext';
import { useMemo, useState } from 'react';
import { AlertTriangle, Download, Filter } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const cls = status === 'HIGH' ? 'status-high' : status === 'LOW' ? 'status-low' : 'status-normal';
  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
};

export default function AlertsPage() {
  const { parsedRows, stats } = useData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 50;

  const days = useMemo(() => [...new Set(parsedRows.map(r => r.dayKey))].sort(), [parsedRows]);

  const alertRows = useMemo(() => {
    return parsedRows.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (dayFilter !== 'all' && r.dayKey !== dayFilter) return false;
      return true;
    });
  }, [parsedRows, statusFilter, dayFilter]);

  const totalPages = Math.ceil(alertRows.length / PER_PAGE);
  const paginated = alertRows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Alert severity breakdown
  const breakdown = useMemo(() => {
    const all = parsedRows.filter(r => r.status !== 'NORMAL');
    const high = parsedRows.filter(r => r.status === 'HIGH');
    const low  = parsedRows.filter(r => r.status === 'LOW');
    // Group contiguous alerts into events
    let events = 0;
    let inAlert = false;
    parsedRows.forEach(r => {
      if (r.status !== 'NORMAL' && !inAlert) { events++; inAlert = true; }
      if (r.status === 'NORMAL') inAlert = false;
    });
    return { total: all.length, high: high.length, low: low.length, events };
  }, [parsedRows]);

  const exportAlerts = () => {
    const header = 'TimeStamp,Temperature,High,Low,Status\n';
    const body = alertRows.map(r =>
      `${r.timestamp.toISOString()},${r.temp},${r.high},${r.low},${r.status}`
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TKM_Alerts_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!stats) return null;

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
              <AlertTriangle size={12} /> Alert Log
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Alert Events
            </h1>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 4 }}>
              {breakdown.total} alert readings · {breakdown.events} distinct events
            </div>
          </div>
          <div className="filter-bar" style={{ margin: 0 }}>
            <select id="alert-status-filter" className="select-input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              <option value="HIGH">HIGH only</option>
              <option value="LOW">LOW only</option>
              <option value="NORMAL">NORMAL only</option>
            </select>
            <select id="alert-day-filter" className="select-input" value={dayFilter} onChange={e => { setDayFilter(e.target.value); setPage(1); }}>
              <option value="all">All Days</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button id="export-alerts-btn" className="btn btn-ghost btn-sm" onClick={exportAlerts}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {[
            { label: 'Total Alert Readings', value: breakdown.total.toLocaleString(), color: 'amber', glowClass: 'card-glow-amber' },
            { label: 'HIGH Temp Events', value: breakdown.high.toLocaleString(), color: 'red', glowClass: 'card-glow-red' },
            { label: 'LOW Temp Events', value: breakdown.low.toLocaleString(), color: 'blue', glowClass: 'card-glow-blue' },
            { label: 'Alert Episodes', value: breakdown.events.toLocaleString(), color: 'cyan', glowClass: 'card-glow-cyan' },
          ].map((c, i) => (
            <div key={i} className={`glass-card kpi-card ${c.color} ${c.glowClass} stagger-child`} style={{ '--i': i }}>
              <div className="kpi-label">{c.label}</div>
              <div className="kpi-value" style={{
                color: c.color === 'red' ? 'var(--color-red)' : c.color === 'amber' ? 'var(--color-amber)' : c.color === 'blue' ? 'var(--color-blue-light)' : 'var(--color-cyan)',
                fontSize: 'var(--text-2xl)',
              }}>
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {/* Alert table */}
        <div className="glass-card chart-panel">
          <div className="chart-header">
            <div>
              <div className="chart-title">Alert Log</div>
              <div className="chart-subtitle">
                Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, alertRows.length)} of {alertRows.length.toLocaleString()} records
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
              <Filter size={12} />
              {statusFilter !== 'all' ? <span className="tag tag-amber">{statusFilter}</span> : null}
              {dayFilter !== 'all' ? <span className="tag tag-cyan">{dayFilter}</span> : null}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="alert-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Temperature</th>
                  <th>High Threshold</th>
                  <th>Low Threshold</th>
                  <th>Status</th>
                  <th>Deviation</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => {
                  const deviation = row.status === 'HIGH'
                    ? +(row.temp - row.high).toFixed(2)
                    : row.status === 'LOW'
                    ? +(row.temp - row.low).toFixed(2)
                    : 0;
                  return (
                    <tr key={row.idx}>
                      <td style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-xs)' }}>{(page - 1) * PER_PAGE + i + 1}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                        {row.timestamp.toLocaleString('en-GB')}
                      </td>
                      <td style={{ fontWeight: 700, color: row.status === 'HIGH' ? 'var(--color-red)' : row.status === 'LOW' ? 'var(--color-blue-light)' : 'var(--color-cyan)' }}>
                        {row.temp.toFixed(2)} °C
                      </td>
                      <td style={{ color: 'var(--color-red)', opacity: 0.7 }}>{row.high} °C</td>
                      <td style={{ color: 'var(--color-blue-light)', opacity: 0.7 }}>{row.low} °C</td>
                      <td><StatusBadge status={row.status} /></td>
                      <td>
                        {deviation !== 0 && (
                          <span style={{ color: deviation > 0 ? 'var(--color-red)' : 'var(--color-blue-light)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                            {deviation > 0 ? '+' : ''}{deviation} °C
                          </span>
                        )}
                        {deviation === 0 && <span style={{ color: 'var(--color-text-3)' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', padding: 'var(--space-4) 0 var(--space-1)' }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', padding: '0 var(--space-3)' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
