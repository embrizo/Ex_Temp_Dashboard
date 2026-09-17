import { useParams } from 'react-router-dom';
import HierarchyListPage from '../../components/hierarchy/HierarchyListPage';
import { useCustomer } from '../../hooks/useCustomers';
import { useFactories } from '../../hooks/useFactories';
import { createFactory, deleteFactory, updateFactory } from '../../services/factories';

export default function FactoriesPage() {
  const { customerId } = useParams();
  const { data: customer } = useCustomer(customerId);
  const { data: factories, loading, error, reload } = useFactories(customerId);

  return (
    <HierarchyListPage
      breadcrumbItems={[
        { label: 'Customers', to: '/' },
        { label: customer?.name || '…', to: `/c/${customerId}` },
      ]}
      heading="Factories"
      addLabel="Add Factory"
      fields={[
        { name: 'name', label: 'Factory Name', required: true, placeholder: 'e.g. Rayong Plant' },
        { name: 'location', label: 'Location', placeholder: 'e.g. Thailand' },
      ]}
      items={factories}
      loading={loading}
      error={error}
      reload={reload}
      onCreate={(values) => createFactory(customerId, values)}
      onUpdate={updateFactory}
      onDelete={deleteFactory}
      itemLink={(item) => `/c/${customerId}/f/${item.id}`}
      renderSubtitle={(item) => item.location}
      emptyMessage="No factories yet. Add the first one to get started."
    />
  );
}
