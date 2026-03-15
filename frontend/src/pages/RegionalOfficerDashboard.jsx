import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Shield, 
  Map as MapIcon, 
  Users, 
  Activity, 
  Waves, 
  Volume2, 
  TrendingUp, 
  Building2, 
  Search,
  ChevronRight,
  Plus,
  Loader2,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import api from '../api/client';
import PageBranding from '../components/PageBranding';

const RegionalOfficerDashboard = () => {
  const { id } = useParams();
  const [industries, setIndustries] = useState([]);
  const [office, setOffice] = useState(null);
  const [logs, setLogs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = id ? `?officeId=${id}` : '';
        const [indRes, logRes, officeRes, teamRes] = await Promise.all([
          api.get(`/regional/industries${queryParams}`),
          api.get(`/monitoring/logs${queryParams}`),
          api.get(`/regional/office${id ? `/${id}` : ''}`),
          api.get(`/regional/teams${queryParams}`)
        ]);
        setIndustries(indRes.data);
        setLogs(logRes.data);
        setOffice(officeRes.data);
        setTeams(teamRes.data);
      } catch (error) {
        console.error('Regional data sync failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       <Loader2 className="animate-spin text-blue-500 mb-6" size={56} />
       <p className="text-text-muted font-black italic text-xs tracking-[0.4em] uppercase animate-pulse">Syncing Jurisdictional Uplink...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <PageBranding title="Regional Intelligence Hub" />
       {/* Regional Header */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Industries', value: industries.length, icon: Building2, color: 'text-blue-500' },
            { label: 'Field Teams', value: '04', icon: Users, color: 'text-emerald-500' },
            { label: 'Pending Logs', value: '12', icon: Activity, color: 'text-amber-500' },
            { label: 'Alert Responses', value: '02', icon: AlertTriangle, color: 'text-rose-500' },
          ].map((s, i) => (
             <div key={i} className="glass-morphism border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between hover:bg-white/5 transition-all">
                <s.icon className={`${s.color} opacity-40`} size={28} />
                <div className="mt-6">
                   <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{s.label}</p>
                   <p className="text-3xl font-black italic text-white">{s.value}</p>
                </div>
             </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Recent Monitoring Logs */}
          <div className="lg:col-span-8 space-y-8">
             <div className="glass-morphism border border-white/5 rounded-[3rem] p-10">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-4">
                      <Activity className="text-blue-500" size={24} /> Live Telemetry
                   </h3>
                   <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors italic">View Timeline Grid</button>
                </div>
                
                <div className="space-y-4">
                   {logs.length > 0 ? logs.map((log, i) => (
                      <div key={i} className="group p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                               {log.monitoring_type === 'Air' ? <Activity size={24} /> : log.monitoring_type === 'Water' ? <Waves size={24} /> : <Volume2 size={24} />}
                            </div>
                            <div>
                               <p className="font-black text-white italic uppercase tracking-tight">{log.monitoring_type} Inspection</p>
                               <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Logged by {log.submitted_by?.name} • 5 mins ago</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black italic text-blue-500">{Object.values(log.value)[0] || 0}</p>
                            <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">Standard Units</p>
                         </div>
                      </div>
                   )) : (
                      <div className="py-20 text-center opacity-30">
                         <Activity size={48} className="mx-auto mb-4" />
                         <p className="font-black italic uppercase tracking-[0.3em] text-xs">No active telemetry in grid.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Monitoring Teams Management */}
          <div className="lg:col-span-4 space-y-8">
             <div className="glass-morphism border border-white/5 rounded-[3rem] p-10 flex flex-col h-full bg-emerald-500/5">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-4">
                      <Users className="text-emerald-500" size={24} /> Field Units
                   </h3>
                   <button className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 hover:scale-110 transition-all">
                      <Plus size={20} />
                   </button>
                </div>
                                <div className="space-y-6 flex-1">
                    {teams.length > 0 ? teams.map((team, i) => (
                       <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:border-emerald-500/50 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-4">
                             <h4 className="font-black text-white uppercase italic tracking-tight">{team.team_name}</h4>
                             <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${team.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                {team.status}
                             </div>
                          </div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{team.members?.length || 0} Registered Personnel</p>
                       </div>
                    )) : (
                       <div className="py-10 text-center opacity-30">
                          <p className="font-black italic uppercase tracking-[0.2em] text-[10px]">No field units assigned.</p>
                       </div>
                    )}
                 </div>
                
                <button className="mt-10 w-full py-5 border border-white/10 rounded-2xl text-[10px] font-black uppercase italic tracking-widest text-text-muted hover:bg-white/5 hover:text-white transition-all">
                   Full Personnel Grid
                </button>
             </div>
          </div>

       </div>
    </div>
  );
};

export default RegionalOfficerDashboard;
