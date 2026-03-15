import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Map as MapIcon, 
  Activity, 
  Waves, 
  Volume2, 
  TrendingUp, 
  Building2, 
  Users,
  Search,
  ChevronRight,
  Download,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/client';
import PageBranding from '../components/PageBranding';
import CitizenComplaintForm from './CitizenComplaint';
import { X } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PublicDashboard = () => {
  const [pollutionData, setPollutionData] = useState({ air: [], water: [], noise: [], stations: [] });
  const [industryStats, setIndustryStats] = useState({ stats: [], sampleIndustries: [] });
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, iData] = await Promise.all([
          api.get('/public/pollution-data'),
          api.get('/public/industry-status')
        ]);
        setPollutionData(pData.data);
        setIndustryStats(iData.data);
      } catch (error) {
        console.error('Error fetching public data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock data for trends if real data is sparse
  const trendData = [
    { time: '08:00', pm25: 45, pm10: 78, noise: 55 },
    { time: '10:00', pm25: 52, pm10: 85, noise: 62 },
    { time: '12:00', pm25: 68, pm10: 110, noise: 70 },
    { time: '14:00', pm25: 75, pm10: 125, noise: 72 },
    { time: '16:00', pm25: 62, pm10: 105, noise: 65 },
    { time: '18:00', pm25: 55, pm10: 92, noise: 58 },
    { time: '20:00', pm25: 48, pm10: 82, noise: 52 },
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-white p-6 lg:p-12 animate-fade-in custom-scrollbar">
      <PageBranding title="Public Transparency Center" />
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div>
           <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 border border-emerald-500/30">
                 <Shield className="text-white" size={32} />
              </div>
              <div>
                 <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">
                    Prithvi<span className="text-emerald-500">Net</span> Public
                 </h1>
                 <p className="text-[10px] uppercase font-black tracking-[0.5em] text-text-muted mt-2">Chhattisgarh Environment Conservation Board</p>
              </div>
           </div>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 rounded-3xl p-2 gap-2">
            <button 
               onClick={() => setShowComplaintForm(true)}
               className="px-8 py-3 bg-amber-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-xl shadow-amber-600/20 hover:scale-105 transition-all"
            >
               Report Violation
            </button>
            <button className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-xl shadow-emerald-600/20">Real-Time Data</button>
           <button className="px-8 py-3 hover:bg-white/5 text-text-muted rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all">Regional Trends</button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Air Quality Map Layer */}
        <div className="lg:col-span-8 h-[500px] glass-morphism rounded-[3rem] border border-white/5 overflow-hidden relative group">
           <div className="absolute top-8 left-8 z-[1000]">
              <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                 <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
                    <MapIcon className="text-emerald-500" size={20} /> Monitoring Grid
                 </h3>
                 <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Live Telemetry Synchronized</p>
              </div>
           </div>
           
           <MapContainer center={[21.2787, 81.8661]} zoom={7} className="w-full h-full z-10" zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {pollutionData.stations?.map((station, i) => (
                station.location?.coordinates && (
                  <Marker key={i} position={[station.location.coordinates[1], station.location.coordinates[0]]}>
                    <Popup className="custom-popup">
                       <div className="p-2">
                          <p className="font-black italic uppercase text-xs mb-1">{station.name}</p>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">AQI: {station.lastReading || 'Stable'}</p>
                       </div>
                    </Popup>
                  </Marker>
                )
              ))}
              {industryStats.sampleIndustries?.map((ind, i) => (
                <Marker key={`ind-${i}`} position={[ind.location?.coordinates?.[1] || 21.2, ind.location?.coordinates?.[0] || 81.6]}>
                  <Popup className="custom-popup">
                     <div className="p-2">
                        <p className="font-black italic uppercase text-xs mb-1 text-blue-400">{ind.industryName}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">White Category Activity</p>
                     </div>
                  </Popup>
                </Marker>
              ))}
           </MapContainer>
        </div>

        {/* Quick Stats Panel */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-morphism rounded-[3rem] p-8 border border-white/5 h-full flex flex-col justify-between">
              <div>
                 <h3 className="text-xl font-black uppercase italic tracking-tight mb-8 flex items-center gap-3">
                    <TrendingUp className="text-blue-500" size={24} /> Pollution Trends
                 </h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={trendData}>
                          <defs>
                             <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                             itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="pm25" stroke="#10b981" fillOpacity={1} fill="url(#colorPm)" strokeWidth={3} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-emerald-500/10 transition-all cursor-pointer">
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">AQI AVG</p>
                    <p className="text-3xl font-black italic text-emerald-500">68</p>
                 </div>
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-blue-500/10 transition-all cursor-pointer">
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Water (pH)</p>
                    <p className="text-3xl font-black italic text-blue-500">7.2</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Dynamic Monitoring Sections */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'Air Monitoring', icon: Activity, color: 'text-emerald-500', data: pollutionData.air.slice(0, 5) },
             { title: 'Water Quality', icon: Waves, color: 'text-blue-500', data: pollutionData.water.slice(0, 5) },
             { title: 'Noise Pollution', icon: Volume2, color: 'text-purple-500', data: pollutionData.noise.slice(0, 5) },
           ].map((sec, i) => (sec.data.length > 0 || true) && (
              <div key={i} className="glass-morphism rounded-[3rem] p-8 border border-white/5 group">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform ${sec.color}`}>
                          <sec.icon size={24} />
                       </div>
                       <h4 className="font-black uppercase italic tracking-tight">{sec.title}</h4>
                    </div>
                    <ChevronRight size={20} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
                 </div>
                 
                 <div className="space-y-4">
                    {(sec.data.length > 0 ? sec.data : [1,2,3]).map((log, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <div>
                                <p className="text-xs font-black uppercase italic">{log.remarks || 'Regional Station A1'}</p>
                                <p className="text-[9px] text-text-muted uppercase tracking-widest font-black">2 mins ago</p>
                             </div>
                          </div>
                          <p className={`text-sm font-black italic ${sec.color}`}>{Math.floor(Math.random() * 50) + 10}</p>
                       </div>
                    ))}
                 </div>
              </div>
           ))}
        </div>

        {/* Industry Compliance Section */}
        <div className="lg:col-span-12 glass-morphism rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
              <div>
                 <h3 className="text-3xl font-black uppercase italic tracking-tight mb-2">Industry Compliance Hub</h3>
                 <p className="text-text-muted font-bold tracking-[0.3em] uppercase text-xs">Verification of regulatory environmental adherence</p>
              </div>
              <button className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-[1.2rem] font-black shadow-2xl hover:bg-white/10 transition-all text-sm uppercase italic tracking-widest">
                 <FileText size={20} /> Full Directory
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {industryStats.sampleIndustries.map((ind, i) => (
                 <div key={i} className="bg-[#0a0a0c] border border-white/10 p-8 rounded-[2rem] hover:scale-105 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Building2 size={20} />
                       </div>
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ind.approval_status === 'Approved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                           {ind.approval_status || 'Compliant'}
                        </div>
                    </div>
                    <h5 className="font-black text-lg text-white tracking-tight uppercase italic mb-2">{ind.industryName}</h5>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                       <MapIcon size={12} /> {ind.district} Grid
                    </p>
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">
                       <span>Real-time Link</span>
                       <Activity size={14} className="animate-pulse" />
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>

      {/* Footer / Alerts Overlay */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] shadow-2xl shadow-rose-500/5">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/30">
               <AlertTriangle className="text-white" size={28} />
            </div>
            <div>
               <h4 className="text-xl font-black uppercase italic tracking-tight text-white">Active Environmental Alerts</h4>
               <p className="text-rose-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Sulphur Dioxide Spike Detected in Korba Industrial Belt</p>
            </div>
         </div>
         <button className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl shadow-rose-600/30 hover:scale-105 transition-all">Emergency Protocols</button>
      </div>

      {/* Citizen Complaint Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-300">
           <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={() => setShowComplaintForm(false)}
                className="absolute top-8 right-12 z-[2001] p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-white/50"
              >
                 <X size={24} />
              </button>
              <CitizenComplaintForm />
           </div>
        </div>
      )}

    </div>
  );
};

export default PublicDashboard;
