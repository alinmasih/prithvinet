const db = require('../config/localDb');
const { v4: uuidv4 } = require('uuid');

const THRESHOLDS = {
  Air: { 'aqi': 100, 'pm25': 60, 'pm10': 100 },
  Water: { 'ph_level': { min: 6.5, max: 8.5 }, 'contamination_index': 50 },
  Noise: { 'noise_db': 75 }
};

const checkAndTriggerAlerts = async (log) => {
  const { monitoring_type, value, region_id, station_id, industry_id } = log;
  const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
  const thresholds = THRESHOLDS[monitoring_type];

  if (!thresholds || !parsedValue) return;

  const breaches = [];
  for (const [param, val] of Object.entries(parsedValue)) {
    const threshold = thresholds[param];
    if (!threshold) continue;

    let isBreached = false;
    if (typeof threshold === 'number') {
      if (val > threshold) isBreached = true;
    } else if (threshold.max !== undefined && val > threshold.max) {
      isBreached = true;
    } else if (threshold.min !== undefined && val < threshold.min) {
      isBreached = true;
    }

    if (isBreached) {
      breaches.push({
        parameter: param,
        value: val,
        limit: typeof threshold === 'number' ? threshold : (threshold.max || threshold.min)
      });
    }
  }

  if (breaches.length > 0) {
    const insertAlert = db.prepare(`
      INSERT INTO alerts (id, type, message, severity, region_id, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const breach of breaches) {
      insertAlert.run(
        uuidv4(),
        'Pollution Exceedance',
        `${monitoring_type} Pollution: ${breach.parameter} is ${breach.value} (Limit: ${breach.limit})`,
        breach.value > breach.limit * 1.5 ? 'High' : 'Medium',
        region_id,
        'Open',
        new Date().toISOString()
      );
    }
  }
};

module.exports = { checkAndTriggerAlerts };
