import React, { useState, useEffect } from 'react';
import { Send, MapPin, Database, Loader2 } from 'lucide-react';
import { getStations, submitPollutionData } from '../../api/monitoring';

const AirSubmission = () => {
  const [formData, setFormData] = useState({
    station_id: '',
    pm25: '',
    pm10: '',
    so2: '',
    nox: '',
    co: '',
    ozone: '',
    temperature: '',
    humidity: ''
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const { data } = await getStations();
        setStations(data.filter(s => s.monitoring_type === 'Air'));
      } catch (error) {
        console.error('Failed to fetch stations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { station_id, ...air_data } = formData;
      await submitPollutionData({
        stationId: station_id,
        reading_type: 'Air',
        data: Object.fromEntries(
          Object.entries(air_data).map(([k, v]) => [k, parseFloat(v)])
        )
      });
      alert('Air quality data submitted successfully!');
      setFormData({
        station_id: '',
        pm25: '',
        pm10: '',
        so2: '',
        nox: '',
        co: '',
        ozone: '',
        temperature: '',
        humidity: ''
      });
    } catch (error) {
      alert('Error submitting data: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Air Quality Data Entry</h2>
          <p className="text-text-muted text-sm mt-1">Record hourly pollutants for registered monitoring teams.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
          <Database size={14} /> Local Cache Active
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted block flex items-center gap-2">
              <MapPin size={14} className="text-primary" /> Select Monitoring Team
            </label>
            <select 
              name="station_id"
              value={formData.station_id}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none"
              required
              disabled={loading}
            >
              <option value="">{loading ? 'Loading stations...' : 'Choose a station...'}</option>
              {stations.map(s => <option key={s._id} value={s._id}>{s.location_name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputGroup label="PM 2.5 (µg/m³)" name="pm25" value={formData.pm25} onChange={handleChange} placeholder="e.g. 42" />
          <InputGroup label="PM 10 (µg/m³)" name="pm10" value={formData.pm10} onChange={handleChange} placeholder="e.g. 85" />
          <InputGroup label="SO2 (µg/m³)" name="so2" value={formData.so2} onChange={handleChange} placeholder="e.g. 12" />
          <InputGroup label="NOx (µg/m³)" name="nox" value={formData.nox} onChange={handleChange} placeholder="e.g. 24" />
          <InputGroup label="CO (mg/m³)" name="co" value={formData.co} onChange={handleChange} placeholder="e.g. 1.2" />
          <InputGroup label="O3 (µg/m³)" name="ozone" value={formData.ozone} onChange={handleChange} placeholder="e.g. 35" />
          <InputGroup label="Temperature (°C)" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="e.g. 32" />
          <InputGroup label="Humidity (%)" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="e.g. 45" />
        </div>

        <div className="pt-6 border-t border-white/5">
          <button 
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {submitting ? 'Submitting...' : 'Submit Measurement'}
          </button>
        </div>
      </form>
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-text-muted">{label}</label>
    <input
      type="number"
      step="0.01"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all placeholder:text-white/10"
      required
    />
  </div>
);

export default AirSubmission;
