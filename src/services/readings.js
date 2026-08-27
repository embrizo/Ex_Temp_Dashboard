import { api } from './apiClient';

export const listReadings = (sensorId, { from, to, limit } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (limit) params.set('limit', limit);
  const qs = params.toString();
  return api.get(`/sensors/${sensorId}/readings${qs ? `?${qs}` : ''}`);
};
