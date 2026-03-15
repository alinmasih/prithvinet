import React, { useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormMultiSelect from './FormMultiSelect';
import FormDate from './FormDate';
import { Send, RotateCcw, X } from 'lucide-react';

const DeployStationForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    stationName: '',
    stationType: '',
    regionalOffice: '',
    latitude: '',
    longitude: '',
    parameters: [],
    sensorType: '',
    iotDeviceId: '',
    installationDate: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  const typeOptions = ['Air Quality', 'Water Quality', 'Noise Monitoring', 'Multi-parameter'];
  const officeOptions = ['Raipur Central', 'Bilaspur North', 'Bhilai West', 'Korba Industrial', 'Jagdalpur South'];
  const sensorOptions = ['Electrochemical', 'Optical Particle Counter', 'NDIR Sensor', 'Laser Scattering', 'Ultrasonic'];
  const parameterOptions = [
    'PM2.5', 'PM10', 'SO2', 'NO2', 'CO', 'O3', 'Noise', 'Water PH', 'Water DO', 'Water BOD', 'Water COD', 'Temperature'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.stationName) newErrors.stationName = 'Station name is required';
    if (!formData.stationType) newErrors.stationType = 'Select a station type';
    if (!formData.regionalOffice) newErrors.regionalOffice = 'Regional office is required';
    if (!formData.latitude || formData.latitude < -90 || formData.latitude > 90) newErrors.latitude = 'Invalid latitude (-90 to 90)';
    if (!formData.longitude || formData.longitude < -180 || formData.longitude > 180) newErrors.longitude = 'Invalid longitude (-180 to 180)';
    if (!formData.sensorType) newErrors.sensorType = 'Sensor type is required';
    if (!formData.iotDeviceId) newErrors.iotDeviceId = 'IoT Device ID is required';
    if (!formData.installationDate) newErrors.installationDate = 'Installation date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-900/40 rounded-3xl border border-white/5 shadow-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-white italic tracking-tight">DEPLOY MONITORING TEAM</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <FormInput 
          label="Station Name" 
          name="stationName" 
          value={formData.stationName} 
          onChange={handleChange} 
          error={errors.stationName} 
          placeholder="e.g. Raipur East Air Station"
        />
        <FormSelect 
          label="Station Type" 
          name="stationType" 
          value={formData.stationType} 
          onChange={handleChange} 
          options={typeOptions}
          error={errors.stationType} 
        />
        <FormSelect 
          label="Regional Office" 
          name="regionalOffice" 
          value={formData.regionalOffice} 
          onChange={handleChange} 
          options={officeOptions}
          error={errors.regionalOffice} 
        />
        <FormDate 
          label="Installation Date" 
          name="installationDate" 
          value={formData.installationDate} 
          onChange={handleChange} 
          error={errors.installationDate} 
        />
        <FormInput 
          label="Latitude" 
          name="latitude" 
          type="number"
          step="0.0001"
          value={formData.latitude} 
          onChange={handleChange} 
          error={errors.latitude} 
          placeholder="e.g. 21.2514"
        />
        <FormInput 
          label="Longitude" 
          name="longitude" 
          type="number"
          step="0.0001"
          value={formData.longitude} 
          onChange={handleChange} 
          error={errors.longitude} 
          placeholder="e.g. 81.6296"
        />
        <FormSelect 
          label="Sensor Technology" 
          name="sensorType" 
          value={formData.sensorType} 
          onChange={handleChange} 
          options={sensorOptions}
          error={errors.sensorType} 
        />
        <FormInput 
          label="IoT Device ID" 
          name="iotDeviceId" 
          value={formData.iotDeviceId} 
          onChange={handleChange} 
          error={errors.iotDeviceId} 
          placeholder="SN-IOT-XXXXX"
        />
        <div className="md:col-span-2">
          <FormMultiSelect 
            label="Monitored Parameters" 
            name="parameters" 
            selectedOptions={formData.parameters} 
            onChange={handleChange} 
            options={parameterOptions}
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button 
          type="submit" 
          className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Send size={18} /> DEPLOY STATION
        </button>
        <button 
          type="button" 
          onClick={() => setFormData({ ...formData, stationName: '', parameters: [] })}
          className="px-6 py-4 bg-white/5 text-white/50 font-bold rounded-2xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} /> RESET
        </button>
      </div>
    </form>
  );
};

export default DeployStationForm;
