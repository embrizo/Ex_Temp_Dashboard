import { api } from './apiClient';

export const listFactories = (customerId) => api.get(`/customers/${customerId}/factories`);
export const getFactory = (id) => api.get(`/factories/${id}`);
export const createFactory = (customerId, data) => api.post(`/customers/${customerId}/factories`, data);
export const updateFactory = (id, data) => api.patch(`/factories/${id}`, data);
export const deleteFactory = (id) => api.del(`/factories/${id}`);
