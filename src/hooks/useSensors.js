import { useApi } from './useApi';
import { getSensor, listSensors } from '../services/sensors';

export const useSensors = (machineId) =>
  useApi(() => (machineId ? listSensors(machineId) : Promise.resolve([])), [machineId]);

export const useSensor = (id) =>
  useApi(() => (id ? getSensor(id) : Promise.resolve(null)), [id]);
