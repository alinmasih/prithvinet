import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Mail, 
  Shield, 
  Trash2, 
  UserPlus, 
  Search, 
  Activity,
  Loader2,
  Radio, 
  Droplets, 
  Factory,
  Unlock,
  ShieldCheck,
  RefreshCw,
  X,
  Plus
} from 'lucide-react';
import api from '../api/auth';
import { register } from '../api/auth';
import { createStation, createIndustry, createWaterSource } from '../api/monitoring';
import CreateUserForm from '../components/forms/CreateUserForm';
import DeployStationForm from '../components/forms/DeployStationForm';
import RegisterIndustryForm from '../components/forms/RegisterIndustryForm';
import RegisterWaterSourceForm from '../components/forms/RegisterWaterSourceForm';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeForm, setActiveForm] = useState('user'); // 'user', 'station', 'industry', 'water'
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData) => {
    try {
      await register(userData);
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error('User creation failed:', error);
      alert('Failed to authorize user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleManagementAction = async (action, data) => {
    try {
      if (action === 'station') await createStation(data);
      if (action === 'industry') await createIndustry(data);
      if (action === 'water') await createWaterSource(data);
      
      setShowForm(false);
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} registered successfully.`);
    } catch (error) {
      console.error(`${action} registration failed:`, error);
      alert(`Action failed: ` + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to revoke access for this identity?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Deletion failed:', error);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in relative min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-indigo-500/10 p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">Access Control</h1>
              <p className="text-text-muted text-[10px] font-black italic uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                <ShieldCheck size={14} className="text-indigo-500 animate-pulse" /> Identity Grid Management
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Find Identity..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-[1.2rem] py-4 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full md:w-64 transition-all uppercase italic"
              />
           </div>
           
           <div className="flex gap-2">
              <button 
                onClick={() => { setActiveForm('user'); setShowForm(true); }}
                className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-[1.2rem] font-black shadow-lg hover:scale-105 transition-all text-[10px] uppercase italic tracking-widest"
                title="Provision New User"
              >
                <UserPlus size={16} /> User
              </button>
              <button 
                onClick={() => { setActiveForm('station'); setShowForm(true); }}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-[1.2rem] font-black shadow-lg hover:scale-105 transition-all text-[10px] uppercase italic tracking-widest"
                title="Deploy Monitoring Team"
              >
                <Radio size={16} /> Station
              </button>
              <button 
                onClick={() => { setActiveForm('industry'); setShowForm(true); }}
                className="flex items-center gap-2 px-6 py-4 bg-rose-600 text-white rounded-[1.2rem] font-black shadow-lg hover:scale-105 transition-all text-[10px] uppercase italic tracking-widest"
                title="Register Industrial Unit"
              >
                <Factory size={16} /> Industry
              </button>
              <button 
                onClick={() => { setActiveForm('water'); setShowForm(true); }}
                className="flex items-center gap-2 px-6 py-4 bg-cyan-600 text-white rounded-[1.2rem] font-black shadow-lg hover:scale-105 transition-all text-[10px] uppercase italic tracking-widest"
                title="Add Water Source"
              >
                <Droplets size={16} /> Water
              </button>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-indigo-500 mb-6" size={56} />
          <p className="text-text-muted font-black italic text-xs tracking-[0.4em] uppercase animate-pulse">Synchronizing Cryptographic Keys...</p>
        </div>
      ) : (
        <div className="glass-morphism rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-white/[0.03] text-text-muted text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="py-8 px-10">Identity & Metadata</th>
                  <th className="py-8 px-10">Authorization Role</th>
                  <th className="py-8 px-10">Regional Grid</th>
                  <th className="py-8 px-10">Access Status</th>
                  <th className="py-8 px-10 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-8 px-10">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/10 group-hover:scale-110 transition-all border border-white/10 font-black text-sm uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-lg text-white tracking-tight uppercase italic">{u.name}</p>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-10">
                        <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-indigo-400 transition-colors">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-8 px-10 text-xs font-black text-text-muted uppercase italic tracking-widest">
                        {u.region || 'Central Grid Operations'}
                      </td>
                      <td className="py-8 px-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {u.status || 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="py-8 px-10 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            className="p-4 bg-white/5 rounded-2xl hover:bg-indigo-600/20 text-indigo-400 transition-all border border-white/10"
                            title="Reset Security Protocol"
                          >
                            <Unlock size={20} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-4 bg-white/5 rounded-2xl hover:bg-rose-500 text-white transition-all border border-white/10 group/del"
                            title="Revoke Identity"
                          >
                            <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-32 text-center text-text-muted italic font-black uppercase tracking-[0.4em] text-xs">
                      No identities found in the current synchronization grid.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-black/70 animate-in fade-in zoom-in duration-300">
           <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
              {activeForm === 'user' && <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setShowForm(false)} />}
              {activeForm === 'station' && <DeployStationForm onSubmit={(data) => handleManagementAction('station', data)} onCancel={() => setShowForm(false)} />}
              {activeForm === 'industry' && <RegisterIndustryForm onSubmit={(data) => handleManagementAction('industry', data)} onCancel={() => setShowForm(false)} />}
              {activeForm === 'water' && <RegisterWaterSourceForm onSubmit={(data) => handleManagementAction('water', data)} onCancel={() => setShowForm(false)} />}
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
