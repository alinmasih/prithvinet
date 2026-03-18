import React, { useState } from 'react';
import { Send, MapPin, AlertCircle, Camera, Shield, X, Info } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CitizenComplaintForm = () => {
  const [formData, setFormData] = useState({
    pollution_type: 'Air',
    location: '',
    district: '',
    description: '',
    anonymous: false,
    reporter_name: '',
    reporter_email: '',
    reporter_phone: ''
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock hotspot data for Chhattisgarh (Raipur centered)
  const hotspots = [
    { pos: [21.2514, 81.6296], intensity: 200, label: "Industrial Cluster A" },
    { pos: [21.2350, 81.6500], intensity: 150, label: "Traffic Congestion Zone" },
    { pos: [21.2800, 81.6000], intensity: 100, label: "Waste Dumping Site" }
  ];

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, use FormData for file uploads
    const dataToSend = { ...formData, evidence_count: files.length };

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
    try {
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });


      if (response.ok) {
        const data = await response.json();
        setSubmitted(true);
        // alert(`Complaint registered successfully. Your Tracking ID: ${data._id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to submit complaint: ${errorData.message || 'Please check your input.'}`);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-12 text-center">
        <div className="glass-morphism rounded-[2.5rem] p-12 border border-white/5">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="text-primary" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Complaint Submitted</h2>
          <p className="text-text-muted mb-8">
            Thank you for your report. Your tracking ID is <b>PN-{Math.floor(Math.random()*10000)}</b>. 
            Our regional monitoring team has been notified and will investigate shortly.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in py-12 px-6">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight">Public Grievance <span className="text-gradient">Portal</span></h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Report environmental violations or hazards directly to the Chhattisgarh Environment Conservation Board.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <div className="glass-morphism rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Shield size={120} className="text-primary" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {!formData.anonymous && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-3">
                 <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Full Name</label>
                 <input 
                   type="text"
                   name="reporter_name"
                   placeholder="Your Name"
                   value={formData.reporter_name}
                   onChange={handleChange}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-white font-bold"
                 />
               </div>
               <div className="space-y-3">
                 <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Email Address</label>
                 <input 
                   type="email"
                   name="reporter_email"
                   placeholder="your@email.com"
                   value={formData.reporter_email}
                   onChange={handleChange}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-white font-bold"
                 />
               </div>
               <div className="space-y-3">
                 <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Mobile No.</label>
                 <input 
                   type="tel"
                   name="reporter_phone"
                   placeholder="+91..."
                   value={formData.reporter_phone}
                   onChange={handleChange}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-white font-bold"
                 />
               </div>
            </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Offense Category</label>
                <select 
                  name="pollution_type"
                  value={formData.pollution_type}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-white font-bold"
                >
                  <option value="Air">Air Pollution</option>
                  <option value="Water">Water Contamination</option>
                  <option value="Noise">Noise Violation</option>
                  <option value="Waste">Illegal Dumping</option>
                  <option value="Other">Other Violation</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">District / Region</label>
                <select 
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-white font-bold"
                  required
                >
                  <option value="">Select District</option>
                  <option>RAIPUR</option>
                  <option>DURG</option>
                  <option>BHILAI</option>
                  <option>KORBA</option>
                  <option>BILASPUR</option>
                </select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Nearest Landmark / Precise Location</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={18} />
                  <input 
                    type="text"
                    name="location"
                    placeholder="e.g. Near Ghadi Chowk or Industrial Estate Gate No. 4"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-primary transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Detailed Description</label>
              <textarea 
                name="description"
                rows="4"
                placeholder="Please provide specific details about the observation..."
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-primary transition-all resize-none font-medium"
                required
              ></textarea>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
                <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Evidence (Photos/Video)</label>
                <div className="flex flex-wrap gap-4">
                   {files.map((file, i) => (
                      <div key={i} className="relative w-20 h-20 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                         <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="upload" />
                         <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-rose-500 rounded-full p-1"><X size={10} /></button>
                      </div>
                   ))}
                   <label className="w-20 h-20 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all hover:border-primary/50">
                      <Camera className="text-text-muted" size={24} />
                      <span className="text-[8px] font-bold mt-2 text-text-muted uppercase">Add Media</span>
                      <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                   </label>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-6 h-6">
                  <input 
                    type="checkbox"
                    name="anonymous"
                    checked={formData.anonymous}
                    onChange={handleChange}
                    className="peer absolute w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full h-full border-2 border-white/20 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    <Shield size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-xs font-bold text-text-muted group-hover:text-white transition-colors">Identity Protection Active</span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white py-5 rounded-2xl font-black shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'SECURELY UPLOADING...' : <><Send size={20} /> SUBMIT OFFICIAL GRIEVANCE</>}
            </button>
          </form>
        </div>

        {/* Hotspot Section */}
        <div className="space-y-8">
           <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2rem] flex gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                 <Info size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-lg mb-1 italic">Real-time Hotspots</h4>
                 <p className="text-xs text-text-muted leading-relaxed">
                    View active reported clusters across Raipur. This map helps the board prioritize inspections and pollution emergency response.
                 </p>
              </div>
           </div>

           <div className="h-[450px] rounded-[2.5rem] overflow-hidden border border-white/5 relative glass-morphism">
              <MapContainer center={[21.2514, 81.6296]} zoom={13} className="w-full h-full z-0 translate-z-0">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {hotspots.map((h, i) => (
                   <Circle 
                      key={i}
                      center={h.pos} 
                      radius={h.intensity * 2}
                      pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
                   >
                    <Popup>
                       <div className="text-black font-bold p-2">
                          <h6 className="uppercase text-[10px] text-rose-500 mb-1">Violation Hotspot</h6>
                          <p className="text-xs">{h.label}</p>
                       </div>
                    </Popup>
                   </Circle>
                ))}
              </MapContainer>
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-bold text-white z-10 border border-white/10 uppercase tracking-widest">
                 Live Feed Raipur Cluster
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenComplaintForm;
