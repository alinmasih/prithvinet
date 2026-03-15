const mongoose = require('mongoose');

const complianceStatusSchema = new mongoose.Schema({
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true
  },
  aaqms: {
    online: { type: Number, default: 0 },
    offline: { type: Number, default: 0 }
  },
  cems: {
    online: { type: Number, default: 0 },
    offline: { type: Number, default: 0 }
  },
  eqms: {
    online: { type: Number, default: 0 },
    offline: { type: Number, default: 0 }
  },
  submitted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ComplianceStatus', complianceStatusSchema);
