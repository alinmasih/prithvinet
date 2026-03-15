import React, { useState } from 'react';
import { 
  CloudUpload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  History,
  ArrowRight,
  Wind,
  Droplets,
  Trash2,
  Calendar
} from 'lucide-react';
import { submitComplianceStatus } from '../api/monitoring';
import { useAuth } from '../context/AuthContext';

const UploadReport = () => {
  const [reportType, setReportType] = useState('Daily Emission Report');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    // Air Fields
    no2: '', so2: '', pm10: '', pm25: '', o3: '', co: '', nh3: '', pb: '',
    // Water Fields
    ph: '', bod: '', cod: '', tss: '', oilGrease: '',
    // Waste Fields
    wasteCategory: '', quantity: '', storageCondition: 'Secure', disposalMode: 'TSDF',
    // Device Status Fields
    aaqms_online: '0', aaqms_offline: '0',
    cems_online: '0', cems_offline: '0',
    eqms_online: '0', eqms_offline: '0'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (reportType === 'Device Status Update') {
        const payload = {
          industryId: user.industry_id || user.id, // Fallback for testing
          aaqms: { online: Number(formData.aaqms_online), offline: Number(formData.aaqms_offline) },
          cems: { online: Number(formData.cems_online), offline: Number(formData.cems_offline) },
          eqms: { online: Number(formData.eqms_online), offline: Number(formData.eqms_offline) }
        };
        await submitComplianceStatus(payload);
      } else {
        // Handle other reports (existing simulation logic or real API if exists)
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      setSuccess(true);
    } catch (err) {
      alert('Transmission Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const renderAirFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
      {[
        { id: 'no2', label: 'NO2', unit: 'µg/m³' },
        { id: 'so2', label: 'SO2', unit: 'µg/m³' },
        { id: 'pm10', label: 'PM10', unit: 'µg/m³' },
        { id: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
        { id: 'o3', label: 'O3 (8h)', unit: 'µg/m³' },
        { id: 'co', label: 'CO (8h)', unit: 'mg/m³' },
        { id: 'nh3', label: 'NH3', unit: 'µg/m³' },
        { id: 'pb', label: 'Pb', unit: 'µg/m³' },
      ].map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-text-muted ml-1">{field.label} ({field.unit})</label>
          <input 
            type="number" 
            step="0.01"
            name={field.id}
            value={formData[field.id]}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-1 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
      ))}
    </div>
  );

  const renderWaterFields = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
      {[
        { id: 'ph', label: 'pH Level', unit: 'pH' },
        { id: 'bod', label: 'BOD', unit: 'mg/L' },
        { id: 'cod', label: 'COD', unit: 'mg/L' },
        { id: 'tss', label: 'TSS', unit: 'mg/L' },
        { id: 'oilGrease', label: 'Oil & Grease', unit: 'mg/L' },
      ].map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-text-muted ml-1">{field.label} ({field.unit})</label>
          <input 
            type="number" 
            step="0.01"
            name={field.id}
            value={formData[field.id]}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-1 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
      ))}
    </div>
  );

  const renderWasteFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-wider text-text-muted ml-1">Waste Category</label>
        <input 
          type="text" 
          name="wasteCategory"
          value={formData.wasteCategory}
          onChange={handleInputChange}
          placeholder="e.g. Chemical Sludge"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-1 focus:ring-primary/50 outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-wider text-text-muted ml-1">Quantity (MT)</label>
        <input 
          type="number" 
          step="0.001"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="0.000"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-1 focus:ring-primary/50 outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-wider text-text-muted ml-1">Storage Condition</label>
        <select 
          name="storageCondition"
          value={formData.storageCondition}
          onChange={handleInputChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none cursor-pointer"
        >
          <option value="Secure">Secure Enclosure</option>
          <option value="Temporary">Temporary Yard</option>
          <option value="Open">Open Storage (Unauthorized)</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-wider text-text-muted ml-1">Disposal Mode</label>
        <select 
          name="disposalMode"
          value={formData.disposalMode}
          onChange={handleInputChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none cursor-pointer"
        >
          <option value="TSDF">TSDF Facility</option>
          <option value="Recycle">Third Party Recycling</option>
          <option value="Incineration">Co-processing/Incineration</option>
          <option value="Captive">Captive Landfill</option>
        </select>
      </div>
    </div>
  );

  const renderDeviceFields = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'aaqms', label: 'AAQMS', color: 'emerald' },
          { id: 'cems', label: 'CEMS', color: 'blue' },
          { id: 'eqms', label: 'EQMS', color: 'purple' },
        ].map((sys) => (
          <div key={sys.id} className={`p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6`}>
             <h5 className={`text-xs font-black uppercase tracking-widest text-${sys.color}-500 italic`}>{sys.label} Status</h5>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-text-muted">Online</label>
                   <input 
                     type="number"
                     name={`${sys.id}_online`}
                     value={formData[`${sys.id}_online`]}
                     onChange={handleInputChange}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-emerald-500 outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-text-muted">Offline</label>
                   <input 
                     type="number"
                     name={`${sys.id}_offline`}
                     value={formData[`${sys.id}_offline`]}
                     onChange={handleInputChange}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-rose-500 outline-none"
                   />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grow animate-fade-in p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
      {/* Header Context */}
      <div className="flex flex-col lg:flex-row gap-10 mb-12">
        <div className="flex-1 glass-morphism border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 group-hover:rotate-0 transition-transform">
              <ShieldCheck className="text-white" size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Compliance Node</h1>
              <div className="text-text-muted font-black uppercase tracking-[0.4em] text-[10px] mt-2 italic flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Secure Data Transmission Terminal
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[400px] bg-white/5 border border-white/10 rounded-[3.5rem] p-10 flex flex-col justify-center">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mb-4 italic">Next Mandatory Filing</div>
            <div className="flex items-center gap-4">
               <Calendar className="text-primary" size={24} />
               <h3 className="text-2xl font-black italic text-white uppercase italic">15 MAR 2026</h3>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="glass-morphism border border-white/10 rounded-[3.5rem] p-12 relative overflow-hidden">
            {success ? (
              <div className="text-center py-24 space-y-10 animate-in zoom-in duration-500">
                <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50">
                  <CheckCircle2 className="text-white" size={56} />
                </div>
                <div>
                  <h3 className="text-4xl font-black italic text-white uppercase tracking-tight">Data Synchronized</h3>
                  <p className="text-text-muted font-black uppercase tracking-[0.3em] text-[11px] mt-4">Transaction ID: TXN-{(Math.random()*10000).toFixed(0)}-SECURE</p>
                </div>
                <button 
                  onClick={() => { setSuccess(false); setFormData(prev => ({ ...prev, title: '' })); }}
                  className="px-14 py-6 bg-white/10 border border-white/20 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-primary hover:text-black hover:border-transparent transition-all shadow-2xl"
                >
                  New Transmission Pulse
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-2">Filing Designation</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.G. Q1_TELEMETRY_SYNC"
                      value={formData.title}
                      name="title"
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/5"
                    />
                  </div>
                  <div className="md:w-1/3 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-2">Temporal Log</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      name="date"
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-2">System Protocol Selection</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'Daily Emission Report', icon: Wind, label: 'Air Emissions' },
                      { id: 'Water Discharge Log', icon: Droplets, label: 'Water Discharge' },
                      { id: 'Hazardous Waste Audit', icon: Trash2, label: 'Hazardous Waste' },
                      { id: 'Device Status Update', icon: FileText, label: 'Device Status' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setReportType(type.id)}
                        className={`
                          p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-4 group
                          ${reportType === type.id 
                            ? 'bg-primary border-transparent text-black shadow-2xl shadow-primary/20 scale-105' 
                            : 'bg-white/5 border-white/10 text-text-muted hover:border-white/30 hover:text-white'}
                        `}
                      >
                        <type.icon size={28} className={reportType === type.id ? 'text-black' : 'group-hover:scale-110 transition-transform'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-10 italic">
                    {reportType.toUpperCase()} PARAMETERS
                  </h4>
                  {reportType === 'Daily Emission Report' && renderAirFields()}
                  {reportType === 'Water Discharge Log' && renderWaterFields()}
                  {reportType === 'Hazardous Waste Audit' && renderWasteFields()}
                  {reportType === 'Device Status Update' && renderDeviceFields()}
                </div>

                <button 
                  type="submit"
                  disabled={uploading || !formData.title}
                  className="w-full py-8 bg-primary text-black rounded-3xl font-black uppercase italic tracking-[0.4em] text-sm shadow-3xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-6 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} /> ENCRYPTING TELEMETRY...
                    </>
                  ) : (
                    <>
                      SYNCHRONIZE WITH CENTRAL HUB <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
           <div className="glass-morphism border border-white/5 p-12 rounded-[3.5rem] h-full flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tight flex items-center gap-3">
                  <History className="text-primary" size={28} /> Filing History
                </h3>
                <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-text-muted border border-white/5">
                  Local Cache
                </div>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                {[
                  { name: 'AIR_EMISSION_DAILY', status: 'SYNCHRONIZED', date: 'TODAY, 10:24 AM', icon: Wind },
                  { name: 'WATER_LOG_FEB_24', status: 'PENDING_HUB', date: '21 HOURS AGO', icon: Droplets },
                  { name: 'WASTE_AUDIT_JAN', status: 'SYNCHRONIZED', date: 'MAR 10', icon: Trash2 },
                  { name: 'AIR_EMISSION_FIX', status: 'SYNCHRONIZED', date: 'MAR 05', icon: Wind }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:bg-white/[0.08] transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                          <item.icon size={18} className="text-white/40 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white italic tracking-tight uppercase">{item.name}</p>
                          <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">{item.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`mt-2 text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${item.status === 'SYNCHRONIZED' ? 'text-emerald-500' : 'text-orange-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'SYNCHRONIZED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]'}`}></div>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
