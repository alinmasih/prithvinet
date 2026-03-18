import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  MapPin, 
  Users, 
  Activity,
  FileSearch,
  ChevronRight,
  Loader2,
  TrendingUp,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import api from '../api/client';
import PageBranding from '../components/PageBranding';

const AdminDashboard = () => {
  const [pendingIndustries, setPendingIndustries] = useState([]);
  const [allIndustries, setAllIndustries] = useState([]);
  const [regionalOfficers, setRegionalOfficers] = useState([]);
  const [regionalOffices, setRegionalOffices] = useState([]);
  const [monitoringTeams, setMonitoringTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Approvals');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [indRes, userRes, officeRes, teamRes, allIndRes] = await Promise.all([
          api.get('/admin/industries'),
          api.get('/users?role=Regional Officer'),
          api.get('/admin/regional-offices').catch(() => ({ data: [] })),
          api.get('/admin/monitoring-teams').catch(() => ({ data: [] })),
          api.get('/admin/all-industries').catch(() => ({ data: [] }))
        ]);
        setPendingIndustries(indRes.data || []);
        setRegionalOfficers(userRes.data || []);
        setRegionalOffices(officeRes.data || []);
        setMonitoringTeams(teamRes.data || []);
        setAllIndustries(allIndRes.data || []);
      } catch (error) {
        console.error('Data sync failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [selectedRO, setSelectedRO] = useState({});

  const handleApprove = async (id, status) => {
    try {
      const roId = selectedRO[id];
      if (status === 'Approved' && !roId) {
        alert('Please assign a Regional Officer for approval.');
        return;
      }
      const res = await api.post('/admin/approve-industry', { 
         industryId: id, 
         status,
         regionalOfficerId: roId
      });
      setPendingIndustries(prev => prev.filter(p => p._id !== id));
      
      if (res.data.credentials) {
        const { email, temporaryPassword } = res.data.credentials;
        alert(`Industry Approved!\nCredentials generated:\nEmail: ${email}\nPassword: ${temporaryPassword}\nPlease share these with the industry representative.`);
      } else {
        alert(`Industry ${status} and assigned successfully.`);
      }
    } catch (error) {
      alert('Action failed: ' + error.message);
    }
  };

  const handleROChange = (industryId, roId) => {
    setSelectedRO(prev => ({ ...prev, [industryId]: roId }));
  };

  const stats = [
    { label: 'Pending Approvals', value: pendingIndustries.length, icon: FileSearch, color: 'text-amber-500' },
    { label: 'Regional Offices', value: regionalOffices.length, icon: MapPin, color: 'text-blue-500' },
    { label: 'Active Industries', value: allIndustries.length, icon: Building2, color: 'text-emerald-500' },
    { label: 'Monitoring Teams', value: monitoringTeams.length, icon: Users, color: 'text-primary' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       <Loader2 className="animate-spin text-primary mb-6" size={56} />
       <p className="text-text-muted font-black italic text-xs tracking-[0.4em] uppercase animate-pulse">Synchronizing Admin Grid...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in p-2">
      <PageBranding title="Industrial Node Profile" />
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
         <div className="flex-1 bg-primary/10 border border-primary/20 p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
               <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase mb-4 text-glow">Admin <br/><span className="text-primary">Oversight Grid</span></h1>
               <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'Approvals', label: 'Approvals' },
                    { id: 'Offices', label: 'Regional Offices' },
                    { id: 'Teams', label: 'Monitoring Teams' },
                    { id: 'Industries', label: 'All Industries' },
                    { id: 'Officers', label: 'Authorized Personnel' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)} 
                      className={`px-6 py-2 rounded-xl font-black uppercase italic tracking-widest text-[9px] transition-all ${activeTab === tab.id ? 'bg-primary text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="grid grid-cols-2 gap-6 lg:w-[400px]">
            {stats.map((s, i) => (
               <div key={i} className="glass-morphism border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between hover:bg-white/5 transition-all">
                  <s.icon className={`${s.color} opacity-40`} size={24} />
                  <div className="mt-4">
                     <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">{s.label}</p>
                     <p className="text-xl font-black italic text-white">{s.value}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="glass-morphism border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl min-h-[400px]">
         {activeTab === 'Approvals' && (
            <>
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight">Registration Queue</h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Industrial filing verification required</p>
                 </div>
                 <div className="px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2">
                    <Activity size={14} className="animate-pulse" /> Pending Sync
                 </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                 <table className="w-full text-left min-w-[1000px]">
                    <thead>
                       <tr className="bg-white/[0.02] text-text-muted text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                          <th className="py-8 px-10">Entity & Industry</th>
                          <th className="py-8 px-10">District Grid</th>
                          <th className="py-8 px-10">Jurisdiction Assignment</th>
                          <th className="py-8 px-10">Legal Credentials</th>
                          <th className="py-8 px-10 text-right">Verification Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {pendingIndustries.length > 0 ? pendingIndustries.map(ind => (
                          <tr key={ind._id} className="hover:bg-white/5 transition-colors group">
                             <td className="py-8 px-10">
                                <div className="flex items-center gap-5">
                                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                      <Building2 size={24} />
                                   </div>
                                   <div>
                                      <p className="font-black text-lg italic uppercase tracking-tight text-white">{ind.industryName || ind.industry_name}</p>
                                      <p className="text-[10px] text-text-muted font-black tracking-widest uppercase">{ind.industryType || 'White Category'}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="py-8 px-10">
                                <span className="text-xs font-black uppercase italic tracking-widest text-text-muted flex items-center gap-2">
                                   <MapPin size={14} className="text-primary" /> {ind.district}
                                </span>
                             </td>
                             <td className="py-8 px-10">
                                <select 
                                  value={selectedRO[ind._id] || ''} 
                                  onChange={(e) => handleROChange(ind._id, e.target.value)}
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase italic tracking-widest text-white/70 outline-none focus:border-primary transition-all"
                                >
                                   <option value="" className="bg-background">Select RO</option>
                                   {regionalOfficers.map(ro => (
                                      <option key={ro._id} value={ro._id} className="bg-background">{ro.name} ({ro.region || ro.district})</option>
                                   ))}
                                </select>
                             </td>
                             <td className="py-8 px-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">PAN: {ind.panNumber}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 italic">GST: {ind.gstNumber || 'N/A'}</p>
                             </td>
                             <td className="py-8 px-10 text-right">
                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                   <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-text-muted transition-all"><FileSearch size={20} /></button>
                                   <button onClick={() => handleApprove(ind._id, 'Rejected')} className="p-4 bg-white/5 rounded-2xl hover:bg-rose-500 text-white transition-all"><XCircle size={20} /></button>
                                   <button onClick={() => handleApprove(ind._id, 'Approved')} className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-500 text-white transition-all shadow-xl shadow-emerald-500/20"><CheckCircle2 size={20} /></button>
                                </div>
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan="5" className="py-32 text-center">
                                <Activity size={48} className="text-white/5 mx-auto mb-6" />
                                <p className="text-text-muted font-black italic uppercase tracking-[0.4em] text-xs">Queue Clean. All identities verified.</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </>
         )}

         {activeTab === 'Offices' && (
            <div className="p-10">
               <h3 className="text-2xl font-black uppercase italic tracking-tight mb-8">Regional Office Directory</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {regionalOffices.map(office => (
                     <div key={office._id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-start mb-6">
                           <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                              <Building2 size={24} />
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-3 py-1 rounded-lg">Active Unit</span>
                        </div>
                        <h4 className="text-xl font-black italic uppercase text-white mb-2">{office.office_name}</h4>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-4">Jurisdiction: {office.district}</p>
                        <div className="space-y-2">
                           <p className="text-xs text-text-muted flex items-center gap-2"><MapPin size={12} /> {office.address}</p>
                           <p className="text-xs text-text-muted flex items-center gap-2">📞 {office.phone}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'Teams' && (
            <div className="p-10">
               <h3 className="text-2xl font-black uppercase italic tracking-tight mb-8">Monitoring Squad Registry</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {monitoringTeams.map(team => (
                     <div key={team._id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/5 transition-all">
                        <h4 className="text-xl font-black italic uppercase text-white mb-4">{team.team_name}</h4>
                        <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-6">Led by: <span className="text-primary">{team.regional_officer?.name || 'N/A'}</span></p>
                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Assigned Personnel:</p>
                           <div className="flex flex-wrap gap-2">
                              {team.members?.map(m => (
                                 <span key={m._id} className="px-3 py-1.5 bg-white/5 rounded-xl text-[9px] font-black uppercase italic tracking-wider text-white/70 border border-white/5">{m.name}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {activeTab === 'Industries' && (
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left min-w-[1000px]">
                  <thead>
                     <tr className="bg-white/[0.02] text-text-muted text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                        <th className="py-8 px-10">Industry Name</th>
                        <th className="py-8 px-10">Jurisdiction</th>
                        <th className="py-8 px-10">Owner / Principal</th>
                        <th className="py-8 px-10">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {allIndustries.map(ind => (
                        <tr key={ind._id} className="hover:bg-white/5 transition-colors">
                           <td className="py-6 px-10">
                              <p className="font-black italic uppercase text-white">{ind.industry_name || ind.industryName}</p>
                              <p className="text-[9px] text-text-muted font-black tracking-widest uppercase">{ind.industry_type}</p>
                           </td>
                           <td className="py-6 px-10 text-xs font-black uppercase italic text-text-muted">{ind.district}</td>
                           <td className="py-6 px-10">
                              <p className="text-xs font-black text-white">{ind.owner_name}</p>
                              <p className="text-[9px] text-text-muted font-black">{ind.owner_email}</p>
                           </td>
                           <td className="py-6 px-10">
                              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest ${ind.approval_status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{ind.approval_status}</span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {activeTab === 'Officers' && (
            <div className="p-10">
                <h3 className="text-2xl font-black uppercase italic tracking-tight mb-10 pb-6 border-b border-white/5 flex items-center justify-between">
                   Board Personnel 
                   <button className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase italic tracking-widest hover:bg-primary hover:text-black transition-all">
                      <UserPlus size={14} className="inline mr-2 outline-none" /> Provision New
                   </button>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {regionalOfficers.map((ro, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                               <Users size={24} />
                            </div>
                            <div>
                               <p className="font-black text-white italic tracking-tighter uppercase">{ro.name}</p>
                               <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">{ro.region || ro.district || 'Chhattisgarh Central'}</p>
                            </div>
                         </div>
                         <ChevronRight size={20} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                   ))}
                </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default AdminDashboard;
