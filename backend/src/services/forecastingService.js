const supabase = require('../config/supabaseClient');
const aiService = require('./aiService');
const externalForecastingService = require('./externalForecastingService');

/**
 * Aggregates data from various Supabase sources for forecasting
 * @param {Object} filters - Filtering criteria (regionId, stationId, etc.)
 */
const aggregateHistoricalData = async (filters = {}) => {
  try {
    const limit = 50; 
    
    // 1. Fetch Monitoring Logs
    const { data: logs, error: logsError } = await supabase
      .from('monitoring_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (logsError) throw logsError;

    // 2. Fetch IoT Sensor Data
    const { data: sensors, error: sensorsError } = await supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (sensorsError) throw sensorsError;

    // 3. Fetch Real-time Environmental Data (from our newly standard tables)
    // NOTE: We'll attempt to fetch, ignoring errors if tables haven't been fully populated yet
    const { data: airQuality } = await supabase
      .from('air_quality')
      .select('*')
      .order('last_update', { ascending: false })
      .limit(limit);
    
    const { data: waterQuality } = await supabase
      .from('water_quality')
      .select('*')
      .order('last_update', { ascending: false })
      .limit(limit);
      
    const { data: noisePollution } = await supabase
      .from('noise_pollution')
      .select('*')
      .order('last_update', { ascending: false })
      .limit(limit);

    // Format for consumption
    return {
      monitoring_logs: (logs || []).map(l => ({
        type: l.monitoring_type,
        values: l.value,
        time: l.timestamp
      })),
      iot_sensors: (sensors || []).map(s => ({
        pm25: s.pm25,
        pm10: s.pm10,
        temp: s.temperature,
        noise: s.noise_level,
        time: s.timestamp
      })),
      real_time_air: (airQuality || []).map(a => ({ aqi: a.aqi, pm25: a.pm25, time: a.last_update })),
      real_time_water: (waterQuality || []).map(w => ({ ci: w.contamination_index, ph: w.ph_level, time: w.last_update })),
      real_time_noise: (noisePollution || []).map(n => ({ db: n.noise_db, time: n.last_update }))
    };
  } catch (error) {
    console.error("Aggregation Error:", error.message);
    return { error: error.message };
  }
};

/**
 * Performs simple linear regression to detect trends
 */
const calculateTrend = (data) => {
  const n = data.length;
  if (n < 2) return 0;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
};

const calculateMean = (data) => {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
};

const calculateStdDev = (data, mean) => {
  if (data.length <= 1) return 0;
  const m = mean || calculateMean(data);
  const variance = data.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (data.length - 1);
  return Math.sqrt(variance);
};

const getSyntheticBaseline = (type, timestamp) => {
  const hour = timestamp.getHours();
  const cycle = Math.sin(((hour - 6) / 24) * 2 * Math.PI);
  
  switch(type) {
    case 'Air':
      return 80 + (cycle * 40) + (Math.random() * 10);
    case 'Water':
      return 30 + (cycle * 15) + (Math.random() * 5);
    case 'Noise':
      return 60 + (cycle * 20) + (Math.random() * 5);
    default:
      return 50;
  }
};

/**
 * Generates projections using Supabase-backed historical data
 */
const generateMultiStepForecast = async (type, filters = {}) => {
  const history = await aggregateHistoricalData(filters);
  
  if (history.error) {
    throw new Error("Failed to aggregate historical data: " + history.error);
  }

  const [externalForecasts, waqiData] = await Promise.all([
    externalForecastingService.fetchOpenMeteoForecast(),
    externalForecastingService.fetchWAQIData()
  ]);
  
  const WEIGHT_LOCAL = 0.3;
  const WEIGHT_EXTERNAL = 0.4;
  const WEIGHT_WAQI = 0.3;

  let dataPoints = [];
  if (type === 'Air') {
    dataPoints = [
      ...(history.real_time_air || []).map(a => a.aqi || a.pm25),
      ...(history.iot_sensors || []).map(s => s.pm25),
      ...(history.monitoring_logs || []).filter(l => l.type === 'Air').map(l => (l.values ? (l.values.aqi || l.values.pm25) : null))
    ];
  } else if (type === 'Water') {
    dataPoints = [
      ...(history.real_time_water || []).map(w => w.ci || w.ph),
      ...(history.monitoring_logs || []).filter(l => l.type === 'Water').map(l => (l.values ? (l.values.ph_level || l.values.contamination_index) : null))
    ];
  } else if (type === 'Noise') {
    dataPoints = [
      ...(history.real_time_noise || []).map(n => n.db),
      ...(history.iot_sensors || []).map(s => s.noise),
      ...(history.monitoring_logs || []).filter(l => l.type === 'Noise').map(l => (l.values ? (l.values.noise_db || l.values.average_db) : null))
    ];
  }

  dataPoints = dataPoints.filter(v => v !== null && v !== undefined && !isNaN(v)).reverse();

  const now = new Date();
  const forecasts = [];
  const slope = dataPoints.length >= 2 ? calculateTrend(dataPoints) : 0;
  const mean = dataPoints.length > 0 ? calculateMean(dataPoints) : null;
  const stdDev = dataPoints.length > 0 ? Math.max(calculateStdDev(dataPoints, mean), (mean || 50) * 0.05) : 10;

  for (let i = 1; i <= 12; i++) {
    const hours = i * 6;
    const timestamp = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const hourOfDay = timestamp.getHours();
    
    let point;
    let reasoning;

    if (dataPoints.length > 0) {
      const trendComponent = slope * (dataPoints.length + i);
      const diurnalFactor = Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI) * (stdDev * 0.5);
      const statisticalPoint = mean + trendComponent + diurnalFactor;

      const extMatch = externalForecasts ? externalForecasts.find(ef => ef.hoursAhead === hours) : null;
      let externalPoint = null;
      if (extMatch && type === 'Air') externalPoint = extMatch.pm2_5;

      let waqiPoint = null;
      if (waqiData && type === 'Air') {
          waqiPoint = waqiData.aqi;
          const dayStr = timestamp.toISOString().split('T')[0];
          const dailyTrend = waqiData.forecast?.daily?.pm25?.find(d => d.day === dayStr);
          if (dailyTrend) waqiPoint = (waqiPoint + dailyTrend.avg) / 2;
      }

      if (externalPoint !== null && waqiPoint !== null) {
        point = (statisticalPoint * WEIGHT_LOCAL) + (externalPoint * WEIGHT_EXTERNAL) + (waqiPoint * WEIGHT_WAQI);
        reasoning = `Multi-source Fusion: Blended local Supabase stats (${(WEIGHT_LOCAL*100).toFixed(0)}%), Open-Meteo ML (${(WEIGHT_EXTERNAL*100).toFixed(0)}%), and real-time WAQI feed (${(WEIGHT_WAQI*100).toFixed(0)}%).`;
      } else if (externalPoint !== null) {
        point = (statisticalPoint * 0.4) + (externalPoint * 0.6);
        reasoning = `Hybrid forecast: Blended local Supabase trend (40%) with Open-Meteo ML-based model (60%).`;
      } else if (waqiPoint !== null) {
        point = (statisticalPoint * 0.5) + (waqiPoint * 0.5);
        reasoning = `Hybrid forecast: Blended local Supabase stats (50%) with real-time WAQI sensor data (50%).`;
      } else {
        point = statisticalPoint;
        reasoning = `Projected using linear regression (slope: ${slope.toFixed(3)}) on Supabase historical data.`;
      }
    } else {
      point = getSyntheticBaseline(type, timestamp);
      reasoning = `Synthetic projection based on ${type} industry standards (standardized on Supabase architecture).`;
    }
    
    point = parseFloat(Math.max(0, point).toFixed(2));
    forecasts.push({
      timestamp: `+${hours}h`,
      point: point,
      uncertainty_low: parseFloat(Math.max(0, point - (1.96 * stdDev)).toFixed(2)),
      uncertainty_high: parseFloat((point + (1.96 * stdDev)).toFixed(2)),
      confidence_score: dataPoints.length > 10 ? 0.92 : 0.75,
      reasoning: reasoning
    });
  }

  let aiInsight = "Data collection in progress.";
  if (dataPoints.length > 0 || waqiData || externalForecasts) {
    const summary = {
      type,
      currentLocal: dataPoints[dataPoints.length - 1],
      waqiCurrent: waqiData?.aqi,
      trend: slope > 0 ? 'increasing' : 'decreasing',
      horizon: '72h'
    };
    aiInsight = await aiService.analyzeEnvironmentalData(
      `Generate a 1-sentence AI insight for this ${type} forecast trend.`,
      summary
    );
  }

  return { 
    forecasts,
    ai_insight: aiInsight,
    metadata: {
      type,
      samples: dataPoints.length,
      trend: slope > 0 ? 'Increasing' : slope < 0 ? 'Decreasing' : 'Stable',
      last_observed: dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : null
    }
  };
};

module.exports = {
  aggregateHistoricalData,
  generateMultiStepForecast
};
