import { useApi } from './useApi';
import { getMachine, listMachines } from '../services/machines';

export const useMachines = (lineId) =>
  useApi(() => (lineId ? listMachines(lineId) : Promise.resolve([])), [lineId]);

export const useMachine = (id) =>
  useApi(() => (id ? getMachine(id) : Promise.resolve(null)), [id]);
