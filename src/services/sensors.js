import { api } from './apiClient';

export const listSensors = (machineId) => api.get(`/machines/${machineId}/sensors`);
export const getSensor = (id) => api.get(`/sensors/${id}`);
export const createSensor = (machineId, data) => api.post(`/machines/${machineId}/sensors`, data);
export const updateSensor = (id, data) => api.patch(`/sensors/${id}`, data);
export const deleteSensor = (id) => api.del(`/sensors/${id}`);
