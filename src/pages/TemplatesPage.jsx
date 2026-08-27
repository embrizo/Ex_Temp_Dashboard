import { Download, FileText, Thermometer, Wind } from 'lucide-react';

export default function TemplatesPage() {
  const downloadCSV = (type) => {
    let content = '';
    let filename = '';

    if (type === 'temperature') {
      content = `TimeStamp,Temperature,High,Low,Status
2026-06-01 08:00:00,24.5,30.0,20.0,NORMAL
2026-06-01 08:01:00,25.1,30.0,20.0,NORMAL
2026-06-01 08:02:00,31.2,30.0,20.0,HIGH
2026-06-01 08:03:00,19.5,30.0,20.0,LOW
2026-06-01 08:04:00,26.8,30.0,20.0,NORMAL`;
      filename = `Temperature_Example.csv`;
    } else {
      content = `TimeStamp,AirFlow,High,Low,Status
2026-06-01 12:42:00,850.5,1000.0,500.0,NORMAL
2026-06-01 12:43:00,920.1,1000.0,500.0,NORMAL
2026-06-01 12:44:00,1050.2,1000.0,500.0,HIGH
2026-06-01 12:45:00,480.0,1000.0,500.0,LOW
2026-06-01 12:46:00,750.3,1000.0,500.0,NORMAL`;
      filename = `AirFlow_Example.csv`;
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div style={{ marginBottom: 'var(--space-8)', paddingTop: 'var(--space-6)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
            <FileText size={12} /> Templates
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Example CSV Files
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-2)', maxWidth: 560 }}>
            Download example files for each sensor type to see the required column format before uploading your own data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          
          {/* Temperature Template */}
          <div className="glass-card card-glow-cyan" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Thermometer size={24} color="var(--color-cyan)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 'var(--text-lg)' }}>Temperature Sensor</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)' }}>Standard thermal format (°C)</div>
              </div>
            </div>
            
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 8, fontWeight: 600 }}>REQUIRED COLUMNS</div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span className="tag tag-cyan">TimeStamp</span>
                <span className="tag tag-cyan">Temperature</span>
                <span className="tag">High</span>
                <span className="tag">Low</span>
                <span className="tag">Status</span>
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => downloadCSV('temperature')}>
              <Download size={16} /> Download Example CSV
            </button>
          </div>

          {/* Air Flow Template */}
          <div className="glass-card card-glow-blue" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wind size={24} color="var(--color-blue-light)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 'var(--text-lg)' }}>Air Flow Sensor</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)' }}>Ventilation monitoring (L/min)</div>
              </div>
            </div>
            
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 8, fontWeight: 600 }}>REQUIRED COLUMNS</div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span className="tag tag-cyan">TimeStamp</span>
                <span className="tag tag-blue">AirFlow</span>
                <span className="tag">High</span>
                <span className="tag">Low</span>
                <span className="tag">Status</span>
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'var(--color-blue-light)', color: '#000' }} onClick={() => downloadCSV('airflow')}>
              <Download size={16} /> Download Example CSV
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
