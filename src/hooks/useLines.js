import { useApi } from './useApi';
import { getLine, listLines } from '../services/lines';

export const useLines = (factoryId) =>
  useApi(() => (factoryId ? listLines(factoryId) : Promise.resolve([])), [factoryId]);

export const useLine = (id) =>
  useApi(() => (id ? getLine(id) : Promise.resolve(null)), [id]);
