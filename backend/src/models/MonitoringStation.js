const mongoose = require('mongoose');

const monitoringStationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true
  },
  stationType: {
    type: String,
    enum: ['Air Quality', 'Water Quality', 'Noise Monitoring', 'Multi-parameter', 'Head Office', 'Regional Office'],
    required: true
  },
  regionalOffice: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  parameters: [{
    type: String,
    enum: ['PM2.5', 'PM10', 'SO2', 'NO2', 'CO', 'O3', 'Noise', 'Water PH', 'Water DO', 'Water BOD', 'Water COD', 'Temperature']
  }],
  units: {
    type: Map,
    of: String
  },
  installationDate: {
    type: Date,
    required: true
  },
  sensorType: {
    type: String,
    required: true
  },
  iotDeviceId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Inactive'],
    default: 'Active'
  },
  address: String,
  phone: String,
  email: String,
  website: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('MonitoringStation', monitoringStationSchema, 'stations');
