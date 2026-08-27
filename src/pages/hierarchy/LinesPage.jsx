import { useParams } from 'react-router-dom';
import HierarchyListPage from '../../components/hierarchy/HierarchyListPage';
import { useCustomer } from '../../hooks/useCustomers';
import { useFactory } from '../../hooks/useFactories';
import { useLines } from '../../hooks/useLines';
import { createLine, deleteLine, updateLine } from '../../services/lines';

export default function LinesPage() {
  const { customerId, factoryId } = useParams();
  const { data: customer } = useCustomer(customerId);
  const { data: factory } = useFactory(factoryId);
  const { data: lines, loading, error, reload } = useLines(factoryId);

  return (
    <HierarchyListPage
      breadcrumbItems={[
        { label: 'Customers', to: '/' },
        { label: customer?.name || '…', to: `/c/${customerId}` },
        { label: factory?.name || '…', to: `/c/${customerId}/f/${factoryId}` },
      ]}
      heading="Production Lines"
      addLabel="Add Line"
      fields={[
        { name: 'name', label: 'Line Name', required: true, placeholder: 'e.g. Line 1' },
        { name: 'description', label: 'Description', placeholder: 'e.g. Assembly line' },
      ]}
      items={lines}
      loading={loading}
      error={error}
      reload={reload}
      onCreate={(values) => createLine(factoryId, values)}
      onUpdate={updateLine}
      onDelete={deleteLine}
      itemLink={(item) => `/c/${customerId}/f/${factoryId}/l/${item.id}`}
      renderSubtitle={(item) => item.description}
      emptyMessage="No production lines yet. Add the first one to get started."
    />
  );
}
