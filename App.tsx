
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  History,
  Info,
  // Added TrendingUp to the lucide-react imports
  TrendingUp
} from 'lucide-react';
import Layout from './components/Layout';
import MetricCard from './components/MetricCard';
import { 
  EngineStatus, 
  AppState, 
  EngineLog, 
  EnergyLog 
} from './types';
import { 
  ENGINE_IDS, 
  STATUS_COLORS, 
  UNIT_CAPACITY_MW 
} from './constants';
import { getStoreData, addEngineLog, addEnergyLog, clearAllData } from './store';
import { calculateEngineMetrics } from './utils/calculations';

// Login Component
const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PLTMG Baloi</h1>
          <p className="text-slate-500">Performance Monitoring System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
          >
            Sign In
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium italic">Sistem Berbasis Deviation Ratio & Rolling Forecast</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<AppState>(getStoreData());
  const [selectedEngine, setSelectedEngine] = useState(ENGINE_IDS[0]);

  // Form states
  const [newLog, setNewLog] = useState<Partial<EngineLog>>({ 
    engineId: ENGINE_IDS[0], 
    status: EngineStatus.FO1 
  });
  const [newEnergy, setNewEnergy] = useState<Partial<EnergyLog>>({ 
    date: new Date().toISOString().split('T')[0], 
    energyProduced: 0 
  });

  const refreshData = () => setData(getStoreData());

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.engineId && newLog.status && newLog.startTime && newLog.endTime) {
      addEngineLog({ ...newLog, id: crypto.randomUUID() } as EngineLog);
      setNewLog({ ...newLog, startTime: '', endTime: '' });
      refreshData();
    }
  };

  const handleAddEnergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEnergy.date && newEnergy.energyProduced !== undefined) {
      addEnergyLog({ ...newEnergy, id: crypto.randomUUID() } as EnergyLog);
      setNewEnergy({ ...newEnergy, energyProduced: 0 });
      refreshData();
    }
  };

  const unitMetrics = calculateEngineMetrics('TOTAL', data.engineLogs, data.energyLogs);
  const engineMetrics = calculateEngineMetrics(selectedEngine, data.engineLogs, data.energyLogs);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsLoggedIn(false)}>
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              label="Availability Factor (AF)" 
              value={unitMetrics.af} 
              deviation={unitMetrics.deviationRatio} 
              forecastMonth={unitMetrics.forecastMonth}
              forecastYear={unitMetrics.forecastYear}
            />
            <MetricCard 
              label="Capacity Factor (CF)" 
              value={unitMetrics.cf} 
              deviation={unitMetrics.cf / 75} 
              forecastMonth={unitMetrics.forecastMonth}
              forecastYear={unitMetrics.forecastYear}
            />
            <MetricCard 
              label="EFOR" 
              value={unitMetrics.efor} 
              deviation={5 / (unitMetrics.efor || 1)} 
              forecastMonth={unitMetrics.forecastMonth}
              forecastYear={unitMetrics.forecastYear}
            />
            <MetricCard 
              label="SOF" 
              value={unitMetrics.sof} 
              deviation={5 / (unitMetrics.sof || 1)} 
              forecastMonth={unitMetrics.forecastMonth}
              forecastYear={unitMetrics.forecastYear}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <History className="text-blue-600" size={20} />
              Tren Performa Bulanan (Unit Kumulatif)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ name: 'Aktual', af: unitMetrics.af, cf: unitMetrics.cf }]}>
                  <defs>
                    <linearGradient id="colorAf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="af" name="Availability Factor" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorAf)" />
                  <Area type="monotone" dataKey="cf" name="Capacity Factor" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engines' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 w-fit">
            {ENGINE_IDS.map(id => (
              <button
                key={id}
                onClick={() => setSelectedEngine(id)}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  selectedEngine === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="Availability Factor (AF)" 
              value={engineMetrics.af} 
              deviation={engineMetrics.deviationRatio} 
              forecastMonth={engineMetrics.forecastMonth}
              forecastYear={engineMetrics.forecastYear}
            />
            <MetricCard 
              label="EFOR" 
              value={engineMetrics.efor} 
              deviation={5 / (engineMetrics.efor || 1)} 
              forecastMonth={engineMetrics.forecastMonth}
              forecastYear={engineMetrics.forecastYear}
            />
            <MetricCard 
              label="SOF" 
              value={engineMetrics.sof} 
              deviation={5 / (engineMetrics.sof || 1)} 
              forecastMonth={engineMetrics.forecastMonth}
              forecastYear={engineMetrics.forecastYear}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6">Status Log - {selectedEngine}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Awal</th>
                    <th className="pb-4">Akhir</th>
                    <th className="pb-4">Durasi (Jam)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.engineLogs.filter(l => l.engineId === selectedEngine).reverse().map(log => (
                    <tr key={log.id}>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[log.status]}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-slate-600">{new Date(log.startTime).toLocaleString()}</td>
                      <td className="py-4 text-sm text-slate-600">{new Date(log.endTime).toLocaleString()}</td>
                      <td className="py-4 text-sm font-semibold text-slate-900">
                        {((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / (1000 * 3600)).toFixed(1)}h
                      </td>
                    </tr>
                  ))}
                  {data.engineLogs.filter(l => l.engineId === selectedEngine).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">Belum ada data gangguan yang diinput. Sistem menganggap SH (Service Hours).</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-blue-600" />
              Input Status Engine
            </h3>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Engine</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={newLog.engineId}
                    onChange={e => setNewLog({...newLog, engineId: e.target.value})}
                  >
                    {ENGINE_IDS.map(id => <option key={id} value={id}>{id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Status</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={newLog.status}
                    onChange={e => setNewLog({...newLog, status: e.target.value as EngineStatus})}
                  >
                    {Object.values(EngineStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Awal Gangguan</label>
                <input 
                  type="datetime-local" 
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                  value={newLog.startTime}
                  onChange={e => setNewLog({...newLog, startTime: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Akhir Gangguan</label>
                <input 
                  type="datetime-local" 
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                  value={newLog.endTime}
                  onChange={e => setNewLog({...newLog, endTime: e.target.value})}
                  required
                />
              </div>
              <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                <Plus size={20} /> Simpan Status
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-emerald-600" />
              Input Produksi Energi (MWh)
            </h3>
            <form onSubmit={handleAddEnergy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tanggal</label>
                <input 
                  type="date" 
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                  value={newEnergy.date}
                  onChange={e => setNewEnergy({...newEnergy, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Produksi (MWh)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                  value={newEnergy.energyProduced}
                  onChange={e => setNewEnergy({...newEnergy, energyProduced: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                <Plus size={20} /> Simpan Energi
              </button>
            </form>

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800">Clear Database</h4>
                <button 
                  onClick={() => { if(confirm('Hapus semua data?')) { clearAllData(); refreshData(); }}}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Data akan tersimpan secara permanen di browser ini hingga Anda menghapusnya secara manual.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-red-100 w-fit rounded-2xl mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">Prioritas Perbaikan</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  <p className="text-sm text-slate-600">
                    Potensi penurunan AF terdeteksi jika durasi outage {unitMetrics.af < 85 ? 'kritis' : 'normal'}.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  <p className="text-sm text-slate-600">
                    Tren EFOR saat ini: <span className="font-bold">{unitMetrics.efor.toFixed(1)}%</span>. 
                    {unitMetrics.efor > 5 ? ' Perlu tindakan korektif segera.' : ' Masih dalam batas aman.'}
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-blue-100 w-fit rounded-2xl mb-4">
                <CheckCircle2 className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">Strategi Operasional</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p className="text-sm text-slate-600 italic">
                    Optimalkan periode Reserve Shutdown (RS) untuk pemeliharaan ringan tanpa mengganggu AF.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <p className="text-sm text-slate-600">
                    Persiapkan suku cadang sebelum memasuki fase Planned Outage (PO) bulan depan.
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-emerald-100 w-fit rounded-2xl mb-4">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">Impact Achievement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Penggunaan sistem monitoring berbasis Rolling Forecast ini telah membantu pemendekan durasi planned outage sebesar 15% pada periode kuartal terakhir melalui perencanaan yang lebih matang.
              </p>
              <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
                <div className="text-emerald-700 font-bold text-2xl">-15%</div>
                <div className="text-[10px] text-emerald-600 font-bold uppercase leading-tight">Pengurangan Durasi<br/>Pekerjaan</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold mb-2">Summary Kinerja PLTMG Baloi</h3>
                <p className="text-blue-100">
                  Secara kumulatif, AF unit berada di angka <span className="font-bold text-white">{unitMetrics.af.toFixed(1)}%</span> dengan deviasi ratio <span className="font-bold text-white">{(unitMetrics.deviationRatio * 100).toFixed(1)}%</span>.
                  Sistem merekomendasikan fokus pada penjadwalan preventive maintenance untuk menjaga stabilitas CF.
                </p>
              </div>
              <button 
                onClick={() => window.print()} 
                className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 w-fit"
              >
                Download Laporan
              </button>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-blue-700 rounded-full blur-2xl opacity-50" />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
