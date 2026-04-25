
import { AppState, EngineLog, EnergyLog } from './types';

const STORAGE_KEY = 'pltmg_baloi_data';

const initialData: AppState = {
  engineLogs: [],
  energyLogs: [],
};

export const getStoreData = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialData;
};

export const saveStoreData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addEngineLog = (log: EngineLog) => {
  const data = getStoreData();
  data.engineLogs.push(log);
  saveStoreData(data);
};

export const addEnergyLog = (log: EnergyLog) => {
  const data = getStoreData();
  data.energyLogs.push(log);
  saveStoreData(data);
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
