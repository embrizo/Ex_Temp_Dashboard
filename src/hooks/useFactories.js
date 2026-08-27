import { useApi } from './useApi';
import { getFactory, listFactories } from '../services/factories';

export const useFactories = (customerId) =>
  useApi(() => (customerId ? listFactories(customerId) : Promise.resolve([])), [customerId]);

export const useFactory = (id) =>
  useApi(() => (id ? getFactory(id) : Promise.resolve(null)), [id]);
