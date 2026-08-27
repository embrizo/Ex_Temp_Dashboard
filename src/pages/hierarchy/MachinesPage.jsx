import { useParams } from 'react-router-dom';
import HierarchyListPage from '../../components/hierarchy/HierarchyListPage';
import { useCustomer } from '../../hooks/useCustomers';
import { useFactory } from '../../hooks/useFactories';
import { useLine } from '../../hooks/useLines';
import { useMachines } from '../../hooks/useMachines';
import { createMachine, deleteMachine, updateMachine } from '../../services/machines';

export default function MachinesPage() {
  const { customerId, factoryId, lineId } = useParams();
  const { data: customer } = useCustomer(customerId);
  const { data: factory } = useFactory(factoryId);
  const { data: line } = useLine(lineId);
  const { data: machines, loading, error, reload } = useMachines(lineId);

  return (
    <HierarchyListPage
      breadcrumbItems={[
        { label: 'Customers', to: '/' },
        { label: customer?.name || '…', to: `/c/${customerId}` },
        { label: factory?.name || '…', to: `/c/${customerId}/f/${factoryId}` },
        { label: line?.name || '…', to: `/c/${customerId}/f/${factoryId}/l/${lineId}` },
      ]}
      heading="Machines"
      addLabel="Add Machine"
      fields={[
        { name: 'name', label: 'Machine Name', required: true, placeholder: 'e.g. Air Washer 3' },
        { name: 'type', label: 'Type', placeholder: 'e.g. air_washer' },
      ]}
      items={machines}
      loading={loading}
      error={error}
      reload={reload}
      onCreate={(values) => createMachine(lineId, values)}
      onUpdate={updateMachine}
      onDelete={deleteMachine}
      itemLink={(item) => `/c/${customerId}/f/${factoryId}/l/${lineId}/m/${item.id}`}
      renderSubtitle={(item) => item.type}
      emptyMessage="No machines yet. Add the first one to get started."
    />
  );
}
