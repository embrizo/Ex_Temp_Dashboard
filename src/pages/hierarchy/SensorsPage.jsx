import { useParams } from 'react-router-dom';
import HierarchyListPage from '../../components/hierarchy/HierarchyListPage';
import { useCustomer } from '../../hooks/useCustomers';
import { useFactory } from '../../hooks/useFactories';
import { useLine } from '../../hooks/useLines';
import { useMachine } from '../../hooks/useMachines';
import { useSensors } from '../../hooks/useSensors';
import { createSensor, deleteSensor, updateSensor } from '../../services/sensors';

export default function SensorsPage() {
  const { customerId, factoryId, lineId, machineId } = useParams();
  const { data: customer } = useCustomer(customerId);
  const { data: factory } = useFactory(factoryId);
  const { data: line } = useLine(lineId);
  const { data: machine } = useMachine(machineId);
  const { data: sensors, loading, error, reload } = useSensors(machineId);

  return (
    <HierarchyListPage
      breadcrumbItems={[
        { label: 'Customers', to: '/' },
        { label: customer?.name || '…', to: `/c/${customerId}` },
        { label: factory?.name || '…', to: `/c/${customerId}/f/${factoryId}` },
        { label: line?.name || '…', to: `/c/${customerId}/f/${factoryId}/l/${lineId}` },
        { label: machine?.name || '…', to: `/c/${customerId}/f/${factoryId}/l/${lineId}/m/${machineId}` },
      ]}
      heading="Sensors"
      addLabel="Add Sensor"
      fields={[
        { name: 'name', label: 'Sensor Name', required: true, placeholder: 'e.g. Temp Sensor' },
        { name: 'metric', label: 'Metric', placeholder: 'temperature' },
        { name: 'unit', label: 'Unit', placeholder: '°C' },
        { name: 'high_threshold', label: 'High Threshold', type: 'number' },
        { name: 'low_threshold', label: 'Low Threshold', type: 'number' },
      ]}
      items={sensors}
      loading={loading}
      error={error}
      reload={reload}
      onCreate={(values) => createSensor(machineId, values)}
      onUpdate={updateSensor}
      onDelete={deleteSensor}
      itemLink={(item) => `/c/${customerId}/f/${factoryId}/l/${lineId}/m/${machineId}/s/${item.id}`}
      renderSubtitle={(item) => `${item.metric} · ${item.unit || ''}`}
      emptyMessage="No sensors yet. Add the first one to get started."
    />
  );
}
