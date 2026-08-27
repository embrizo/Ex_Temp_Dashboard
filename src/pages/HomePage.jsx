import { useData } from '../context/DataContext';
import CSVUploader from '../components/CSVUploader';
import { Activity, Wind, Trash2, ChevronRight, Layers } from 'lucide-react';

export default function HomePage() {
  const { sensors, setActiveSensorId, removeSensor } = useData();

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div style={{ marginBottom: 'var(--space-8)', paddingTop: 'var(--space-6)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
            <Layers size={12} /> Sensor Management
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
            Sensors & Projects
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-2)', maxWidth: 560 }}>
            Upload CSV data to add a sensor. The dashboard supports Temperature and Air Flow sensors simultaneously.
          </p>
        </div>

        {sensors.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            {sensors.map(sensor => {
              const Icon = sensor.type === 'AirFlow' ? Wind : Activity;
              const isAlert = sensor.stats.alertCount > 0;
              
              return (
                <div key={sensor.id} className={`glass-card ${isAlert ? 'card-glow-amber' : 'card-glow-cyan'}`} style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: sensor.type === 'AirFlow' ? 'rgba(59,130,246,0.15)' : 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={sensor.type === 'AirFlow' ? 'var(--color-blue-light)' : 'var(--color-cyan)'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--text-base)' }}>{sensor.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{sensor.metricName}</div>
                      </div>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => removeSensor(sensor.id)}>
                      <Trash2 size={14} color="var(--color-text-3)" />
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ background: 'var(--color-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 2 }}>Current</div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
                        {sensor.stats.lastVal} <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{sensor.unit}</span>
                      </div>
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 2 }}>Alerts</div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: isAlert ? 'var(--color-amber)' : 'var(--color-green)' }}>
                        {sensor.stats.alertCount} <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>events</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => setActiveSensorId(sensor.id)}>
                    View Dashboard <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ maxWidth: 600 }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--space-3)' }}>+ Add New Sensor</div>
          <CSVUploader />
        </div>
      </div>
    </div>
  );
}
