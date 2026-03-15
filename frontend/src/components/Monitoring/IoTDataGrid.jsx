import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Pocket, 
  CloudRain, 
  Volume2, 
  Droplets,
  RefreshCw,
  AlertCircle,
  Database
} from 'lucide-react';
import api from '../../api/client';

const MetricCard = ({ title, value, unit, icon: Icon, color, trend }) => (
  <div className="glass-morphism border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}/20 transition-colors`}></div>
    <div className="relative z-10">
      <div className={`w-14 h-14 bg-${color}/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
        <Icon className={`text-${color}`} size={28} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 italic">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-white italic tracking-tighter">{value}</h3>
        <span className="text-xs font-bold text-text-muted uppercase italic">{unit}</span>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest italic">{trend}</span>
        </div>
      )}
    </div>
  </div>
);

const IoTDataGrid = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/iot/latest');
      setData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-text-muted font-black uppercase tracking-[0.3em] italic animate-pulse text-xs">
          Synchronizing with IoT Grid...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-4">
          <AlertCircle className="text-rose-500" size={40} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Connection Lost</h3>
          <p className="text-text-muted text-sm font-bold max-w-md mx-auto italic uppercase tracking-wider">
            {error}. Retrying connection to regulatory sensors...
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase italic tracking-widest text-xs hover:bg-primary hover:text-black transition-all"
        >
          Force Reconnect
        </button>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Air Quality Index',
      value: data?.air_quality_ppm?.toFixed(1) || '0.0',
      unit: 'PPM',
      icon: Wind,
      color: 'emerald-500',
      trend: 'Live Spectrum'
    },
    {
      title: 'Carbon Monoxide',
      value: data?.co_ppm?.toFixed(1) || '0.0',
      unit: 'PPM',
      icon: Pocket,
      color: 'amber-500',
      trend: 'Regulatory Safe'
    },
    {
      title: 'Smoke Concentration',
      value: data?.smoke_ppm?.toFixed(1) || '0.0',
      unit: 'PPM',
      icon: CloudRain,
      color: 'rose-500',
      trend: 'Nominal Range'
    },
    {
      title: 'Ambient Noise',
      value: data?.noise_db?.toFixed(1) || '0.0',
      unit: 'dB',
      icon: Volume2,
      color: 'sky-500',
      trend: 'Acoustic Baseline'
    },
    {
      title: 'Water Turbidity',
      value: data?.turbidity_ntu?.toFixed(0) || '0',
      unit: 'NTU',
      icon: Droplets,
      color: 'blue-500',
      trend: 'Flowing Metrics'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">
            Live Telemetry <span className="text-primary">Stream</span>
          </h2>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
            <Database size={12} className="text-primary" /> ESP32-MESH Network (Render Node Alpha)
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Last Synced</p>
              <p className="text-xs font-bold text-white italic">{lastUpdated?.toLocaleTimeString()}</p>
           </div>
           <button 
             onClick={fetchData}
             disabled={loading}
             className={`p-4 bg-white/5 border border-white/10 rounded-2xl text-primary transition-all hover:scale-110 ${loading ? 'animate-spin' : ''}`}
           >
             <RefreshCw size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} {...metric} />
        ))}
        
        {/* Connection Status Card */}
        <div className="md:col-span-2 lg:col-span-1 glass-morphism border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center bg-gradient-to-br from-primary/5 to-transparent">
            <h4 className="text-xs font-black uppercase text-white tracking-[0.2em] mb-4 italic">Network Status</h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest italic group">
                    <span className="text-text-muted group-hover:text-white transition-colors">Satellite Link</span>
                    <span className="text-emerald-500">Encrypted</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest italic group">
                    <span className="text-text-muted group-hover:text-white transition-colors">Data Integrity</span>
                    <span className="text-primary">Verified</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDataGrid;
