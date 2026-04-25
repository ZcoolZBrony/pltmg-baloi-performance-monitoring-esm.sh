
import { EngineStatus } from './types';

export const ENGINE_IDS = ['Engine 1', 'Engine 2', 'Engine 3', 'Engine 4'];
export const UNIT_CAPACITY_MW = 30; // 30 MW
export const ENGINE_CAPACITY_MW = 7.5; // Assuming equal distribution for individual engine CF

export const STATUS_COLORS: Record<string, string> = {
  SH: 'bg-green-100 text-green-800 border-green-200',
  FO1: 'bg-red-100 text-red-800 border-red-200',
  FO2: 'bg-red-100 text-red-800 border-red-200',
  FO3: 'bg-red-100 text-red-800 border-red-200',
  MO: 'bg-orange-100 text-orange-800 border-orange-200',
  PO: 'bg-blue-100 text-blue-800 border-blue-200',
  RS: 'bg-slate-100 text-slate-800 border-slate-200',
  PE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ME: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export const METRIC_LABELS = {
  cf: 'Capacity Factor (CF)',
  af: 'Availability Factor (AF)',
  efor: 'Equiv. Forced Outage Rate (EFOR)',
  sof: 'Scheduled Outage Factor (SOF)'
};

export const TARGET_METRICS = {
  af: 90,
  efor: 5,
  sof: 5,
  cf: 75
};
