
import { EngineLog, EnergyLog, PerformanceMetrics, ForecastMetrics, EngineStatus } from '../types';
import { ENGINE_CAPACITY_MW, UNIT_CAPACITY_MW, TARGET_METRICS } from '../constants';

const getHoursDiff = (start: string, end: string) => {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
};

export const calculateEngineMetrics = (
  engineId: string | 'TOTAL',
  logs: EngineLog[],
  energyLogs: EnergyLog[],
  period: 'month' | 'year' = 'month'
): PerformanceMetrics => {
  const now = new Date();
  const startOfPeriod = new Date(now.getFullYear(), period === 'month' ? now.getMonth() : 0, 1);
  const totalHours = (now.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60);
  
  const relevantLogs = engineId === 'TOTAL' 
    ? logs.filter(l => new Date(l.startTime) >= startOfPeriod)
    : logs.filter(l => l.engineId === engineId && new Date(l.startTime) >= startOfPeriod);

  const relevantEnergy = energyLogs.filter(e => new Date(e.date) >= startOfPeriod);

  let foh = 0; // Forced Outage Hours
  let moh = 0; // Maintenance Outage Hours
  let poh = 0; // Planned Outage Hours
  let sh = 0;  // Service Hours (to be calculated by subtraction if not explicitly input)

  relevantLogs.forEach(log => {
    const duration = getHoursDiff(log.startTime, log.endTime);
    if (log.status.startsWith('FO')) foh += duration;
    else if (log.status === EngineStatus.MO || log.status === EngineStatus.ME) moh += duration;
    else if (log.status === EngineStatus.PO || log.status === EngineStatus.PE) poh += duration;
  });

  // Calculate Service Hours: Total Hours - Total Outage Hours
  // Note: The prompt says gaps are SH
  const totalPotentialHours = engineId === 'TOTAL' ? totalHours * 4 : totalHours;
  sh = totalPotentialHours - (foh + moh + poh);

  const capacity = engineId === 'TOTAL' ? UNIT_CAPACITY_MW : ENGINE_CAPACITY_MW;
  const totalEnergy = relevantEnergy.reduce((sum, e) => sum + e.energyProduced, 0);
  
  const cf = totalPotentialHours > 0 ? (totalEnergy / (capacity * totalPotentialHours)) * 100 : 0;
  const af = totalPotentialHours > 0 ? ((totalPotentialHours - (foh + moh + poh)) / totalPotentialHours) * 100 : 0;
  const efor = (foh + sh) > 0 ? (foh / (foh + sh)) * 100 : 0;
  const sof = totalPotentialHours > 0 ? ((poh + moh) / totalPotentialHours) * 100 : 0;

  // Use AF as a base for deviation ratio against target
  const deviationRatio = af / TARGET_METRICS.af;

  // Forecast Logic (Rolling Forecast)
  const daysInPeriod = period === 'month' ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : 365;
  const totalPeriodHours = daysInPeriod * 24 * (engineId === 'TOTAL' ? 4 : 1);
  
  const createForecast = (current: number): ForecastMetrics => ({
    realistic: current,
    optimistic: Math.min(100, current * 1.05),
    pessimistic: Math.max(0, current * 0.95),
  });

  return {
    cf,
    af,
    efor,
    sof,
    deviationRatio,
    forecastMonth: createForecast(af),
    forecastYear: createForecast(af),
  };
};
