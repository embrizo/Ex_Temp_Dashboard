import { useData } from '../context/DataContext';
import CSVUploader from '../components/CSVUploader';
import { Upload, FileText, Info, Download } from 'lucide-react';

export default function UploadPage({ onUploaded }) {
  const { stats, fileName, parsedRows } = useData();

  const downloadExampleCSV = () => {
    const csvContent = `"TimeStamp","Temperature","High","Low","Status"\n2026-06-01 12:42:00,24.46,80.0,15.0,="NORMAL"\n2026-06-01 12:43:00,21.16,80.0,15.0,="NORMAL"\n2026-06-01 12:44:00,24.62,80.0,15.0,="NORMAL"\n2026-06-01 12:45:00,81.0,80.0,15.0,="HIGH"\n2026-06-01 12:46:00,14.0,80.0,15.0,="LOW"`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Example_Temperature_Data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)', paddingTop: 'var(--space-6)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
            <Upload size={12} /> Data Import
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Upload Temperature Log
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-2)', maxWidth: 560 }}>
            Upload a CSV export from your DEMO temperature monitoring system.
            The dashboard will automatically parse and visualize the data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Upload zone */}
          <div>
            <CSVUploader onUploaded={onUploaded} />

            {/* Schema hint */}
            <div className="glass-card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-cyan)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  <Info size={14} /> Expected CSV Format
                </div>
                <button className="btn btn-ghost btn-sm" onClick={downloadExampleCSV}>
                  <Download size={14} /> Example CSV
                </button>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', lineHeight: 1.8 }}>
                <div style={{ color: 'var(--color-cyan)', marginBottom: 4 }}>"TimeStamp","Temperature","High","Low","Status"</div>
                <div>2026-06-01 12:42:00,24.46,80.0,15.0,="NORMAL"</div>
                <div>2026-06-01 12:43:00,21.16,80.0,15.0,="NORMAL"</div>
                <div>2026-06-01 12:44:00,24.62,80.0,15.0,="NORMAL"</div>
                <div style={{ color: 'var(--color-amber)' }}>2026-06-01 12:45:00,81.0,80.0,15.0,="HIGH"</div>
                <div style={{ color: 'var(--color-blue-light)' }}>2026-06-01 12:46:00,14.0,80.0,15.0,="LOW"</div>
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Current file info */}
            {stats ? (
              <div className="glass-card card-glow-cyan" style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-cyan)' }}>
                  <FileText size={14} /> Loaded File Summary
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { label: 'File', value: fileName.replace('.csv', ''), mono: true },
                    { label: 'Total Records', value: stats.count.toLocaleString() },
                    { label: 'Date Range', value: `${stats.dateStart?.toLocaleDateString('en-GB')} → ${stats.dateEnd?.toLocaleDateString('en-GB')}` },
                    { label: 'Avg Temperature', value: `${stats.avg} °C` },
                    { label: 'Alert Events', value: stats.alertCount, color: stats.alertCount > 0 ? 'var(--color-amber)' : 'var(--color-green)' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: item.color || 'var(--color-text)', fontFamily: item.mono ? 'monospace' : 'inherit', maxWidth: 160, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  id="goto-overview-btn"
                  className="btn btn-cyan"
                  style={{ width: '100%', marginTop: 'var(--space-4)' }}
                  onClick={onUploaded}
                >
                  View Dashboard →
                </button>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 'var(--space-3)' }}>No Data Loaded</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', lineHeight: 1.7 }}>
                  Upload a DEMO temperature CSV to begin monitoring.
                  The dashboard will display trends, alerts, and statistics.
                </div>
              </div>
            )}

            {/* Features list */}
            <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>Dashboard Features</div>
              {[
                { icon: '📈', text: 'Interactive temperature timeline' },
                { icon: '🌡️', text: 'Min / Max / Avg / Std Dev statistics' },
                { icon: '🔥', text: 'Hour-of-day heat pattern map' },
                { icon: '🚨', text: 'Alert event log & severity breakdown' },
                { icon: '📅', text: 'Day-by-day trend comparison' },
                { icon: '💾', text: 'Export filtered data as CSV' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '6px 0', borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-2)' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
