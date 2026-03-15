import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  MapPin, 
  Activity, 
  ShieldAlert,
  Clock,
  CheckCircle2,
  Filter,
  Loader2,
  AlertOctagon
} from 'lucide-react';
import api from '../api/auth';
import { useSearchParams } from 'react-router-dom';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('type');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/alerts');
        let filteredData = res.data;
        
        if (filterType === 'citizen') {
          filteredData = res.data.filter(a => a.alert_type === 'Citizen Complaint');
        }
        
        setAlerts(filteredData);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [filterType]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-amber-500/10 p-8 rounded-[2.5rem] border border-amber-500/20">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bell className="text-white" size={20} />
            </div>
            <h1 className="text-4xl font-black tracking-tight">System Alerts</h1>
          </div>
          <p className="text-text-muted text-sm font-bold italic uppercase tracking-widest pl-13 flex items-center gap-2">
            <Activity size={14} className="text-amber-500" /> Automated violation detection
          </p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
             <Filter size={18} /> Filter Alerts
           </button>
           <button className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-2xl font-black shadow-xl shadow-amber-500/30 hover:scale-105 transition-all">
             Mark All Resolved
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
          <p className="text-text-muted font-bold italic animate-pulse">Scanning system for violations...</p>
        </div>
      ) : alerts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {alerts.map((alert) => (
            <AlertItem key={alert._id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] glass-morphism rounded-[2.5rem] border-dashed border-2 border-white/10">
          <CheckCircle2 size={48} className="text-emerald-500/20 mb-4" />
          <p className="text-text-muted font-bold italic text-xl">All systems nominal. No active alerts.</p>
        </div>
      )}
    </div>
  );
};

const AlertItem = ({ alert }) => {
  const isHigh = alert.alert_type === 'Pollution Exceedance' || alert.alert_type === 'Industrial Violation' || alert.alert_type === 'Citizen Complaint';
  const isCitizen = alert.alert_type === 'Citizen Complaint';

  return (
    <div className={`group glass-morphism rounded-3xl p-6 border-l-4 transition-all hover:translate-x-2 
      ${isCitizen ? 'border-primary hover:bg-primary/[0.02]' : isHigh ? 'border-rose-500 hover:bg-rose-500/[0.02]' : 'border-amber-500 hover:bg-amber-500/[0.02]'}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
           <div className={`p-4 rounded-2xl ${isCitizen ? 'bg-primary/10 text-primary' : isHigh ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {isCitizen ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
           </div>
           <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-black text-lg uppercase tracking-tight">
                  {isCitizen ? 'Citizen Complaint via Portal' : alert.alert_type}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest 
                  ${alert.status === 'Active' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {alert.status}
                </span>
              </div>
              <p className="text-text-muted text-sm font-medium max-w-2xl leading-relaxed">
                {isCitizen 
                  ? alert.complaint 
                     ? `${alert.complaint.pollution_type} violation reported at ${alert.complaint.location}: ${alert.complaint.description}`
                     : `Community report received: Violation detected at ${alert.location || 'specified area'}. Public assistance request pending field verification.`
                  : alert.alert_type === 'Pollution Exceedance' 
                    ? `${alert.parameter} levels at ${alert.location || 'Unknown'} were detected at ${alert.value}, exceeding the safety limit of ${alert.limit}.`
                    : `Detection of unauthorized activity at ${alert.location || 'designated site'}. Investigative response required.`}
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase italic">
                  <Clock size={12} className="text-amber-500" />
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase italic">
                  <MapPin size={12} className="text-rose-500" />
                  {alert.location || 'Raipur Grid Z-4'}
                </div>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-3 lg:self-center">
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Investigate
            </button>
            <button className="px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
              Mark as Fixed
            </button>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
