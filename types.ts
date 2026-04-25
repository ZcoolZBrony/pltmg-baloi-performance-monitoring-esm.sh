
export enum EngineStatus {
  SH = 'SH',
  FO1 = 'FO1',
  FO2 = 'FO2',
  FO3 = 'FO3',
  MO = 'MO',
  PO = 'PO',
  FD1 = 'FD1',
  FD2 = 'FD2',
  FD3 = 'FD3',
  PE = 'PE',
  ME = 'ME',
  RS = 'RS'
}

export interface EngineLog {
  id: string;
  engineId: string;
  status: EngineStatus;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface EnergyLog {
  id: string;
  date: string;
  energyProduced: number; // MWh
}

export interface ForecastMetrics {
  pessimistic: number;
  realistic: number;
  optimistic: number;
}

export interface PerformanceMetrics {
  cf: number;
  af: number;
  efor: number;
  sof: number;
  deviationRatio: number;
  forecastMonth: ForecastMetrics;
  forecastYear: ForecastMetrics;
}

export interface User {
  username: string;
}

export interface AppState {
  engineLogs: EngineLog[];
  energyLogs: EnergyLog[];
}
