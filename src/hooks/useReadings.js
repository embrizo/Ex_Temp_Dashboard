import { useApi } from './useApi';
import { listReadings } from '../services/readings';

export const useReadings = (sensorId) =>
  useApi(() => (sensorId ? listReadings(sensorId, { limit: 20000 }) : Promise.resolve([])), [sensorId]);
