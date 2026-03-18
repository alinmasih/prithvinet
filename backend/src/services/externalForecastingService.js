const axios = require('axios');

const WAQI_TOKEN = process.env.WAQI_TOKEN || '74b096affa3ca4c06ac62bd7fcde955b8685785e';
const WAQI_URL = process.env.WAQI_API_URL || 'https://api.waqi.info/feed/here/';


/**
 * Service to fetch forecasting data from professional public APIs
 */
class ExternalForecastingService {
  /**
   * Fetch 5-day Air Quality forecast from Open-Meteo
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async fetchOpenMeteoForecast(lat = 21.2514, lon = 81.6296) {
    try {
      // Open-Meteo Air Quality API (No key required)
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,ozone,nitrogen_dioxide&forecast_days=3`;
      
      const response = await axios.get(url);
      const { hourly } = response.data;
      
      if (!hourly || !hourly.time) return null;

      // Map to 6-hour intervals to match our current multi-step forecast structure (+6h, +12h, etc.)
      const forecasts = [];
      const now = new Date();
      
      for (let i = 6; i <= 72; i += 6) {
        // Find the index in the hourly data that corresponds to now + i hours
        const targetTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        // Open-Meteo hourly indices: 0 is current hour, 1 is next hour, etc.
        // We calculate the offset from the first timestamp provided in the response
        const firstTime = new Date(hourly.time[0]);
        const index = Math.floor((targetTime - firstTime) / (60 * 60 * 1000));
        
        if (index >= 0 && index < hourly.pm2_5.length) {
          forecasts.push({
            hoursAhead: i,
            pm2_5: hourly.pm2_5[index],
            pm10: hourly.pm10[index],
            o3: hourly.ozone[index],
            no2: hourly.nitrogen_dioxide[index],
            timestamp: hourly.time[index]
          });
        }
      }

      return forecasts;
    } catch (error) {
      console.error("Open-Meteo API Error:", error.message);
      return null;
    }
  }

  /**
   * Fetch Air Pollution forecast from OpenWeatherMap
   * (Requires API Key)
   */
  async fetchOWMPollutionForecast(lat = 21.2514, lon = 81.6296) {
    const apiKey = process.env.DATA_GOV_API_KEY; // Reusing or expecting OWM key
    if (!apiKey) return null;

    try {
      const url = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const response = await axios.get(url);
      
      if (!response.data.list) return null;

      // OWM returns hourly forecasts for next few days
      return response.data.list.map(item => ({
        time: item.dt * 1000,
        aqi: item.main.aqi,
        components: item.components
      }));
    } catch (error) {
      console.error("OWM API Error:", error.message);
      return null;
    }
  }

  /**
   * Fetch real-time data and daily forecasts from WAQI
   */
  async fetchWAQIData() {
    try {
      const url = `${WAQI_URL}?token=${WAQI_TOKEN}`;
      const response = await axios.get(url);
      
      if (response.data.status !== 'ok') {
        console.warn("WAQI API returned non-OK status:", response.data.status);
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error("WAQI API Error:", error.message);
      return null;
    }
  }
}

module.exports = new ExternalForecastingService();
