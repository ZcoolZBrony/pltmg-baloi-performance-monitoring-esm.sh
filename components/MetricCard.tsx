
import React from 'react';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { ForecastMetrics } from '../types';

interface MetricCardProps {
  label: string;
  value: number;
  deviation: number;
  forecastMonth: ForecastMetrics;
  forecastYear: ForecastMetrics;
  suffix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, deviation, forecastMonth, forecastYear, suffix = '%' }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
          deviation >= 1 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {deviation >= 1 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {(deviation * 100).toFixed(1)}% DR
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-6">
        <h3 className="text-3xl font-bold text-slate-900">{value.toFixed(2)}{suffix}</h3>
        <span className="text-xs text-slate-400">Realisasi Aktual</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Peramalan Bulan Ini</p>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 italic">Optimis</span>
              <span className="text-blue-600 font-bold">{forecastMonth.optimistic.toFixed(1)}{suffix}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 italic">Realistis</span>
              <span className="text-slate-900 font-bold">{forecastMonth.realistic.toFixed(1)}{suffix}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 italic">Pesimis</span>
              <span className="text-red-600 font-bold">{forecastMonth.pessimistic.toFixed(1)}{suffix}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Peramalan Akhir Tahun</p>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 italic">Optimis</span>
              <span className="text-blue-600 font-bold">{forecastYear.optimistic.toFixed(1)}{suffix}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 italic">Realistis</span>
              <span className="text-slate-900 font-bold">{forecastYear.realistic.toFixed(1)}{suffix}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 italic">Pesimis</span>
              <span className="text-red-600 font-bold">{forecastYear.pessimistic.toFixed(1)}{suffix}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
