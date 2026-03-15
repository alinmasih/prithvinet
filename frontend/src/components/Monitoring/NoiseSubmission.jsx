import React, { useState, useEffect } from 'react';
import { Send, MapPin, Database, Volume2, Loader2 } from 'lucide-react';
import { getStations, submitPollutionData } from '../../api/monitoring';

const NoiseSubmission = () => {
  const [formData, setFormData] = useState({
    station_id: '',
    average_db: '',
    peak_db: '',
    duration: '15'
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const { data } = await getStations();
        setStations(data.filter(s => s.monitoring_type === 'Noise'));
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
      const { station_id, duration, ...noise_data } = formData;
      await submitPollutionData({
        stationId: station_id,
        reading_type: 'Noise',
        data: Object.fromEntries(
          Object.entries(noise_data).map(([k, v]) => [k, parseFloat(v)])
        )
      });
      alert('Noise level data submitted successfully!');
      setFormData({
        station_id: '',
        average_db: '',
        peak_db: '',
        duration: '15'
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
          <h2 className="text-2xl font-bold text-rose-500">Noise Monitoring</h2>
          <p className="text-text-muted text-sm mt-1">Capture ambient and peak noise levels in decibels.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 uppercase tracking-widest">
          <Volume2 size={14} /> High Sensitivity Mode
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted block flex items-center gap-2">
              <MapPin size={14} className="text-rose-500" /> Monitoring Team
            </label>
            <select 
              name="station_id"
              value={formData.station_id}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-all appearance-none"
              required
              disabled={loading}
            >
              <option value="">{loading ? 'Loading stations...' : 'Choose a station...'}</option>
              {stations.map(s => <option key={s._id} value={s._id}>{s.location_name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted block">Measurement Duration (mins)</label>
            <select 
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-all appearance-none"
            >
              <option value="15">15 Minutes (Standard)</option>
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes (Long term)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">Average Noise (dB)</label>
            <input
              type="number"
              name="average_db"
              value={formData.average_db}
              onChange={handleChange}
              placeholder="e.g. 68"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">Peak Noise (dB)</label>
            <input
              type="number"
              name="peak_db"
              value={formData.peak_db}
              onChange={handleChange}
              placeholder="e.g. 84"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <button 
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {submitting ? 'Recording...' : 'Record Noise Levels'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoiseSubmission;
