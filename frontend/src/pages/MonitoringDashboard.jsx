import React, { useState } from 'react';
import { 
  Wind, 
  Droplets, 
  Volume2, 
  ClipboardCheck, 
  Send,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Plus
} from 'lucide-react';
import AirSubmission from '../components/Monitoring/AirSubmission';
import WaterSubmission from '../components/Monitoring/WaterSubmission';
import NoiseSubmission from '../components/Monitoring/NoiseSubmission';
import { useAuth } from '../context/AuthContext';

const MonitoringDashboard = () => {
  const [activeTab, setActiveTab] = useState('air');

  const tabs = [
    { id: 'air', name: 'Air Monitoring', icon: Wind },
    { id: 'water', name: 'Water Quality', icon: Droplets },
    { id: 'noise', name: 'Noise Levels', icon: Volume2 },
    { id: 'inspections', name: 'Industrial Inspections', icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Field Submission Portal</h1>
          <div className="text-text-muted mt-2 text-sm font-medium">Logged in as: <span className="text-primary font-bold italic">Monitoring Team Alpha (Raipur)</span></div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
            <Calendar size={16} className="text-primary" />
            <span>March 13, 2026</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
            <Clock size={16} className="text-primary" />
            <span>07:22 AM</span>
          </div>
        </div>

      </div>

      <div className="flex flex-wrap gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105' 
                : 'glass-morphism text-text-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon size={20} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="glass-morphism rounded-[2rem] p-4 min-h-[500px]">
        {activeTab === 'air' && <AirSubmission />}
        {activeTab === 'water' && <WaterSubmission />}
        { activeTab === 'noise' && <NoiseSubmission /> }
        {activeTab === 'inspections' && (
          <div className="p-8 space-y-8 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                   <ClipboardCheck size={24} className="text-primary" /> Industrial Compliance Audit
                </h3>
                <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase tracking-[0.2em] text-text-muted">Raipur Industrial Zone</span>
             </div>


             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Industry</label>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold text-white">
                             <option className="bg-background-alt text-white">Jindal Power Plant - Raipur</option>
                             <option className="bg-background-alt text-white">Monnet Ispat & Energy</option>
                             <option className="bg-background-alt text-white">Sarda Energy & Minerals</option>
                          </select>

                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Inspector Code</label>
                         <input type="text" value="INS-RAI-001" disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-muted font-bold" />
                      </div>
                   </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <div className="font-bold text-sm italic">Digital Audit Checklist</div>
                      <div className="space-y-3">
                         <ChecklistItem label="Valid Environmental Clearance (EC)" />
                         <ChecklistItem label="Stack Monitoring (CEMS) Operational" />
                         <ChecklistItem label="Effluent Treatment Plant (ETP) Functional" />
                         <ChecklistItem label="Hazardous Waste Log Maintained" />
                         <ChecklistItem label="Groundwater Discharge Permit Verified" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Observation Notes</label>
                      <textarea rows="3" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-primary transition-all resize-none font-medium" placeholder="Describe any non-compliance or observations..."></textarea>
                   </div>
                </div>

                 <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                       <div className="text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Substantiating Evidence</div>
                      <div className="w-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all group">
                         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Plus size={24} className="text-text-muted group-hover:text-primary" />
                         </div>
                         <span className="text-[10px] font-bold text-text-muted">UPLOAD GEOTAGGED PHOTO</span>
                      </div>
                   </div>

                   <button className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95">
                      <Send size={18} /> SUBMIT INSPECTION LOG
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChecklistItem = ({ label }) => (
  <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer group">
     <div className="relative w-5 h-5">
        <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
        <div className="w-full h-full border-2 border-white/20 rounded peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
           <MapPin size={12} className="text-white opacity-0 peer-checked:opacity-100" />
        </div>
     </div>
     <div className="text-xs font-bold text-text-muted group-hover:text-white transition-colors">{label}</div>
  </label>
);

export default MonitoringDashboard;
