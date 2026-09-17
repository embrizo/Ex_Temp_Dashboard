import { api } from './apiClient';

export const listMachines = (lineId) => api.get(`/lines/${lineId}/machines`);
export const getMachine = (id) => api.get(`/machines/${id}`);
export const createMachine = (lineId, data) => api.post(`/lines/${lineId}/machines`, data);
export const updateMachine = (id, data) => api.patch(`/machines/${id}`, data);
export const deleteMachine = (id) => api.del(`/machines/${id}`);
