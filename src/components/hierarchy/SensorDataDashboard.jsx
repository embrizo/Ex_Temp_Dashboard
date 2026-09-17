import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { DataProvider, useData } from '../../context/DataContext';
import { transformReadings } from '../../utils/transformReadings';
import SensorCSVUploader from './SensorCSVUploader';
import OverviewPage from '../../pages/OverviewPage';
import AnalysisPage from '../../pages/AnalysisPage';
import HeatmapPage from '../../pages/HeatmapPage';
import AlertsPage from '../../pages/AlertsPage';

const TABS = [
  { id: 'overview', label: 'Overview', Component: OverviewPage },
  { id: 'analysis', label: 'Temperature Analysis', Component: AnalysisPage },
  { id: 'heatmap', label: 'Heat Pattern', Component: HeatmapPage },
  { id: 'alerts', label: 'Alerts', Component: AlertsPage },
];

function DashboardInner({ readings, sensor }) {
  const { loadRows } = useData();
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    loadRows(transformReadings(readings, sensor), sensor.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings, sensor.id]);

  const ActiveComponent = TABS.find((t) => t.id === tab).Component;

  return (
    <>
      <div className="sensor-dashboard-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`sensor-dashboard-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </>
  );
}

export default function SensorDataDashboard({ sensor, readings, onUploaded }) {
  const [showUploader, setShowUploader] = useState(readings.length === 0);

  if (readings.length === 0 || showUploader) {
    return (
      <div style={{ marginTop: 'var(--space-4)' }}>
        <SensorCSVUploader
          sensorId={sensor.id}
          onUploaded={(result) => {
            setShowUploader(false);
            onUploaded(result);
          }}
        />
        {readings.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 'var(--space-3)' }}
            onClick={() => setShowUploader(false)}
          >
            ← Back to dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <DataProvider>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: 'var(--space-4) 0' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowUploader(true)}>
          <Upload size={14} /> Upload more data
        </button>
      </div>
      <DashboardInner readings={readings} sensor={sensor} />
    </DataProvider>
  );
}
