const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  station_id: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  pm25: Number,
  pm10: Number,
  temperature: Number,
  humidity: Number,
  noise_level: Number,
  air_quality_ppm: Number,
  co_ppm: Number,
  smoke_ppm: Number,
  noise_db: Number,
  turbidity_ntu: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
