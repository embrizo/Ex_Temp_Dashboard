import { api } from './apiClient';

export const listLines = (factoryId) => api.get(`/factories/${factoryId}/lines`);
export const getLine = (id) => api.get(`/lines/${id}`);
export const createLine = (factoryId, data) => api.post(`/factories/${factoryId}/lines`, data);
export const updateLine = (id, data) => api.patch(`/lines/${id}`, data);
export const deleteLine = (id) => api.del(`/lines/${id}`);
