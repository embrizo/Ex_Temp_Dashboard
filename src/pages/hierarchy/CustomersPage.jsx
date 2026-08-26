import HierarchyListPage from '../../components/hierarchy/HierarchyListPage';
import { useCustomers } from '../../hooks/useCustomers';
import { createCustomer, deleteCustomer, updateCustomer } from '../../services/customers';

export default function CustomersPage() {
  const { data: customers, loading, error, reload } = useCustomers();

  return (
    <HierarchyListPage
      breadcrumbItems={[{ label: 'Customers', to: '/' }]}
      heading="Customers"
      addLabel="Add Customer"
      fields={[{ name: 'name', label: 'Customer Name', required: true, placeholder: 'e.g. LG' }]}
      items={customers}
      loading={loading}
      error={error}
      reload={reload}
      onCreate={createCustomer}
      onUpdate={updateCustomer}
      onDelete={deleteCustomer}
      itemLink={(item) => `/c/${item.id}`}
      emptyMessage="No customers yet. Add your first customer (e.g. LG) to get started."
    />
  );
}
