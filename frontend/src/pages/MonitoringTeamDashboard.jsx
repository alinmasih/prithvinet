import React, { useState } from 'react';
import { 
  Activity, 
  Waves, 
  Volume2, 
  MapPin, 
  Send, 
  History, 
  ClipboardCheck, 
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PageBranding from '../components/PageBranding';
import FormInput from '../components/forms/FormInput';

const MonitoringTeamDashboard = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'Air',
    location: { coordinates: [81.6296, 21.2514], address: '' },
    value: {},
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeType, setActiveType] = useState('Air');

  const airParams = ['PM2.5', 'PM10', 'SO2', 'NO2', 'CO'];
  const waterParams = ['pH', 'Turbidity', 'DO', 'BOD', 'COD'];
  const noiseParams = ['Daytime (Leq)', 'Nighttime (Leq)'];

  const getParams = () => {
    if (activeType === 'Air') return airParams;
    if (activeType === 'Water') return waterParams;
    return noiseParams;
  };

  const handleValueChange = (param, val) => {
    setFormData(prev => ({
      ...prev,
      value: { ...prev.value, [param]: parseFloat(val) }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/monitoring/${activeType.toLowerCase()}`, {
        ...formData,
        monitoring_type: activeType
      });
      alert('Monitoring log successfully transmitted to Regional Grid.');
      setFormData(prev => ({ ...prev, value: {}, remarks: '' }));
    } catch (error) {
      alert('Submission failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in p-2">
      <PageBranding title="Monitoring Team Terminal" />
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-4">
         <div>
            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">Field <br/><span className="text-emerald-500">Operation Unit</span></h1>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.4em] italic mt-4">Active Monitoring Grid - {user?.name || 'CECB Field Unit'}</p>
         </div>
         <div className="flex bg-white/5 border border-white/10 rounded-[2rem] p-2 gap-2">
            {['Air', 'Water', 'Noise'].map(t => (
               <button 
                 key={t}
                 onClick={() => { setActiveType(t); setFormData(p => ({ ...p, value: {} })); }}
                 className={`px-8 py-3 rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all flex items-center gap-3 ${activeType === t ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-text-muted hover:bg-white/5'}`}
               >
                  {t === 'Air' ? <Activity size={16} /> : t === 'Water' ? <Waves size={16} /> : <Volume2 size={16} />}
                  {t} Protocol
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Submission Form */}
         <div className="lg:col-span-7 bg-[#0a0a0c] border border-white/10 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-2xl">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activeType === 'Air' ? 'from-emerald-500' : activeType === 'Water' ? 'from-blue-500' : 'from-purple-500'} to-transparent`}></div>
            
            <div className="flex items-center gap-5 mb-12">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-all ${activeType === 'Air' ? 'bg-emerald-500/10 text-emerald-500' : activeType === 'Water' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {activeType === 'Air' ? <Activity size={32} /> : activeType === 'Water' ? <Waves size={32} /> : <Volume2 size={32} />}
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{activeType} Quality Log</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                     <MapPin size={12} className="text-emerald-500" /> Sector 7 Industrial Belt
                  </p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getParams().map(p => (
                     <div key={p} className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 italic">{p}</label>
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          value={formData.value[p] || ''}
                          onChange={(e) => handleValueChange(p, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-black italic text-emerald-500"
                        />
                     </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 italic">Latitude Reference</label>
                     <input disabled value={formData.location.coordinates[1]} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black text-text-muted" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 italic">Longitude Reference</label>
                     <input disabled value={formData.location.coordinates[0]} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-xs font-black text-text-muted" />
                  </div>
               </div>

               <FormInput 
                 label="Inspection Field Remarks" 
                 name="remarks" 
                 value={formData.remarks} 
                 onChange={(e) => setFormData(p => ({ ...p, remarks: e.target.value }))}
                 isTextarea 
                 placeholder="Condition of site, visible emissions, or local sensor state..."
               />

               <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase italic tracking-[0.2em] text-sm shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
               >
                  {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                     <>Transmit Log to Board <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" /></>
                  )}
               </button>
            </form>
         </div>

         {/* Side Info & History */}
         <div className="lg:col-span-5 space-y-8 flex flex-col">
            <div className="glass-morphism rounded-[3rem] p-10 border border-white/5 flex-1 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full"></div>
               <h3 className="text-xl font-black uppercase italic tracking-tight mb-8 flex items-center gap-4">
                  <History className="text-emerald-500" size={24} /> Log History
               </h3>
               
               <div className="space-y-4">
                  {[1, 2, 3, 4].map(idx => (
                     <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           <div>
                              <p className="text-xs font-black uppercase italic text-white group-hover:text-emerald-500 transition-colors">Sector 7 Central Grid</p>
                              <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Air Inspection • 1h ago</p>
                           </div>
                        </div>
                        <ClipboardCheck size={20} className="text-white/10 group-hover:text-emerald-500 transition-all" />
                     </div>
                  ))}
               </div>
               
               <button className="mt-10 w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase italic tracking-widest text-text-muted hover:bg-white/10 hover:text-white transition-all">Verification Registry</button>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-[3rem] p-10 flex items-start gap-6">
               <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/20 flex-shrink-0">
                  <AlertCircle className="text-white" size={32} />
               </div>
               <div>
                  <h4 className="text-xl font-black uppercase italic tracking-tight mb-2">Technical Warning</h4>
                  <p className="text-[9px] text-rose-300 font-bold uppercase tracking-widest leading-relaxed">
                     All submitted data is cryptographically timestamped and immutable. Ensure decimal accuracy before transmission to the Board's jurisdiction engine.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MonitoringTeamDashboard;
