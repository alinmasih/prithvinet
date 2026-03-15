const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alert_type: {
    type: String,
    enum: ['Pollution Exceedance', 'Missing Report', 'Industrial Violation', 'Equipment Failure', 'Citizen Complaint'],
    required: true
  },
  parameter: String,
  value: Number,
  limit: Number,
  location: String,
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CitizenReport'
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonitoringStation'
  },
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry'
  },
  assigned_officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegionalOffice'
  },
  status: {
    type: String,
    enum: ['Active', 'Investigating', 'Closed'],
    default: 'Active'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema);
