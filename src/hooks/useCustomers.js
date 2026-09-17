import { useApi } from './useApi';
import { getCustomer, listCustomers } from '../services/customers';

export const useCustomers = () => useApi(listCustomers, []);

export const useCustomer = (id) =>
  useApi(() => (id ? getCustomer(id) : Promise.resolve(null)), [id]);
