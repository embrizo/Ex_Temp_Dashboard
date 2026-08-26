import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import Breadcrumb from '../../components/hierarchy/Breadcrumb';
import EntityModal from '../../components/hierarchy/EntityModal';
import ConfirmDialog from '../../components/hierarchy/ConfirmDialog';
import { useCustomer } from '../../hooks/useCustomers';
import { useFactory } from '../../hooks/useFactories';
import { useLine } from '../../hooks/useLines';
import { useMachine } from '../../hooks/useMachines';
import { useSensor } from '../../hooks/useSensors';
import { deleteSensor, updateSensor } from '../../services/sensors';

const SENSOR_FIELDS = [
  { name: 'name', label: 'Sensor Name', required: true },
  { name: 'metric', label: 'Metric' },
  { name: 'unit', label: 'Unit' },
  { name: 'high_threshold', label: 'High Threshold', type: 'number' },
  { name: 'low_threshold', label: 'Low Threshold', type: 'number' },
];

export default function SensorDetailPage() {
  const { customerId, factoryId, lineId, machineId, sensorId } = useParams();
  const navigate = useNavigate();

  const { data: customer } = useCustomer(customerId);
  const { data: factory } = useFactory(factoryId);
  const { data: line } = useLine(lineId);
  const { data: machine } = useMachine(machineId);
  const { data: sensor, loading, error, reload } = useSensor(sensorId);

  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const machinePath = `/c/${customerId}/f/${factoryId}/l/${lineId}/m/${machineId}`;

  const handleUpdate = async (values) => {
    setBusy(true);
    try {
      await updateSensor(sensorId, values);
      setEditing(false);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteSensor(sensorId);
      navigate(machinePath);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <Breadcrumb
          items={[
            { label: 'Customers', to: '/' },
            { label: customer?.name || '…', to: `/c/${customerId}` },
            { label: factory?.name || '…', to: `/c/${customerId}/f/${factoryId}` },
            { label: line?.name || '…', to: `/c/${customerId}/f/${factoryId}/l/${lineId}` },
            { label: machine?.name || '…', to: machinePath },
            { label: sensor?.name || '…', to: '#' },
          ]}
        />

        {loading && <div className="hierarchy-loading">Loading…</div>}
        {error && <div className="hierarchy-error">Failed to load: {error}</div>}

        {sensor && (
          <>
            <div className="hierarchy-page-header">
              <h1>{sensor.name}</h1>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            <div className="hierarchy-sensor-info glass-card">
              <div className="hierarchy-sensor-field">
                <span className="hierarchy-sensor-label">Metric</span>
                <span>{sensor.metric}</span>
              </div>
              <div className="hierarchy-sensor-field">
                <span className="hierarchy-sensor-label">Unit</span>
                <span>{sensor.unit || '—'}</span>
              </div>
              <div className="hierarchy-sensor-field">
                <span className="hierarchy-sensor-label">High Threshold</span>
                <span>{sensor.high_threshold ?? '—'}</span>
              </div>
              <div className="hierarchy-sensor-field">
                <span className="hierarchy-sensor-label">Low Threshold</span>
                <span>{sensor.low_threshold ?? '—'}</span>
              </div>
            </div>

            <div className="hierarchy-empty" style={{ marginTop: 'var(--space-6)' }}>
              No readings yet. Data upload/live feed for this sensor is coming in a later phase.
              In the meantime, the <a href="/legacy">Legacy CSV Tool</a> can be used to explore the
              existing charts with a sample CSV.
            </div>
          </>
        )}

        {editing && sensor && (
          <EntityModal
            title="Edit Sensor"
            fields={SENSOR_FIELDS}
            initialValues={sensor}
            submitLabel="Save"
            busy={busy}
            onSubmit={handleUpdate}
            onClose={() => setEditing(false)}
          />
        )}

        {confirmingDelete && (
          <ConfirmDialog
            title={`Delete "${sensor.name}"?`}
            message="This will also delete all of its readings. This cannot be undone."
            confirmLabel="Delete"
            busy={busy}
            onConfirm={handleDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </div>
    </div>
  );
}
