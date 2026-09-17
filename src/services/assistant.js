import { api } from './apiClient';

export const askAssistant = (question, scopeSensorId) =>
  api.post('/assistant', { question, scope_sensor_id: scopeSensorId || null });
