import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Waves, 
  Volume2, 
  MapPin, 
  History, 
  ClipboardCheck, 
  Loader2,
  AlertCircle,
  Calendar,
  Search,
  Download
} from 'lucide-react';
import api from '../../api/client';

const MonitoringTeamReports = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, [activeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = activeFilter !== 'All' ? `?type=${activeFilter}` : '';
      const response = await api.get(`/monitoring/logs${query}`);
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to synchronize field logs from regional office.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.monitoring_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.submitted_by?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type) => {
    switch(type) {
      case 'Air': return <Activity size={18} />;
      case 'Water': return <Waves size={18} />;
      case 'Noise': return <Volume2 size={18} />;
      default: return <ClipboardCheck size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-text-muted font-black uppercase tracking-widest text-xs italic">Deciphering Field Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <History className="text-emerald-500" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Field Monitoring Registry</h3>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Real-time Environmental Intelligence Logs</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
             {['All', 'Air', 'Water', 'Noise'].map(t => (
               <button 
                 key={t}
                 onClick={() => setActiveFilter(t)}
                 className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === t ? 'bg-emerald-500 text-white' : 'text-text-muted hover:text-white'}`}
               >
                 {t}
               </button>
             ))}
           </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all w-64 uppercase italic"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl flex items-center gap-4 text-rose-500 font-bold italic">
          <AlertCircle size={24} /> {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLogs.length > 0 ? filteredLogs.map((log) => (
            <div key={log._id} className="glass-morphism border border-white/10 rounded-[2.5rem] p-8 group hover:border-emerald-500/30 transition-all hover:scale-[1.02] relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 ${log.monitoring_type === 'Air' ? 'bg-emerald-500' : log.monitoring_type === 'Water' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
               
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl border border-white/10 shadow-xl ${log.monitoring_type === 'Air' ? 'bg-emerald-500/10 text-emerald-500' : log.monitoring_type === 'Water' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                     {getIcon(log.monitoring_type)}
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic mb-1">Entry Timestamp</p>
                     <p className="text-xs font-black text-white italic">{new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <h4 className="text-lg font-black italic text-white uppercase tracking-tight truncate">{log.monitoring_type} Inspection Log</h4>
                     <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                        <MapPin size={10} className="text-emerald-500" /> Lat: {log.location.coordinates[1].toFixed(4)}, Lng: {log.location.coordinates[0].toFixed(4)}
                     </p>
                  </div>

                  <div className="py-4 border-y border-white/5 grid grid-cols-2 gap-4">
                     {Object.entries(log.value).map(([key, val]) => (
                        <div key={key}>
                           <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">{key}</p>
                           <p className="text-sm font-black text-emerald-500 italic">{val}</p>
                        </div>
                     ))}
                  </div>

                  <div className="pt-2">
                     <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                        <ClipboardCheck size={12} className="text-emerald-500" /> Remarks / Field Notes
                     </p>
                     <p className="text-[11px] font-medium text-text-muted line-clamp-2 leading-relaxed italic">
                        {log.remarks || 'No specific non-compliance markings recorded for this protocol.'}
                     </p>
                  </div>

                  <div className="pt-6 flex justify-between items-center bg-white/[0.02] -mx-8 -mb-8 p-6 border-t border-white/5 rounded-b-[2.5rem]">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-500 uppercase">
                           {log.submitted_by?.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{log.submitted_by?.name}</span>
                     </div>
                     <button className="p-2 hover:bg-white/5 rounded-lg transition-colors group/btn">
                        <Download size={14} className="text-text-muted group-hover/btn:text-emerald-500" />
                     </button>
                  </div>
               </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center glass-morphism border border-white/5 rounded-[3rem]">
              <div className="flex flex-col items-center gap-6">
                <History className="text-white/5" size={64} />
                <div>
                   <p className="text-xl font-black italic text-white uppercase tracking-tight">No active field logs discovered</p>
                   <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em] mt-2">The current selection does not contain any synchronized environmental telemetry.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonitoringTeamReports;
