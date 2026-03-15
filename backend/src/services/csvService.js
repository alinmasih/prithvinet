const fs = require('fs');
const PollutionReading = require('../models/PollutionReading');

/**
 * Parses a water pollution CSV file and returns the data
 * Format: station_id, ph, do, bod, cod, turbidity, date
 */
const parseWaterPollutionCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const lines = data.split('\n');
      const results = [];
      
      // Assume header: station_id, ph, dissolved_oxygen, bod, cod, turbidity, date
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [station_id, ph, dissolved_oxygen, bod, cod, turbidity, date] = line.split(',');
        
        results.push({
          station_id,
          water_data: {
            ph: parseFloat(ph),
            dissolved_oxygen: parseFloat(dissolved_oxygen),
            bod: parseFloat(bod),
            cod: parseFloat(cod),
            turbidity: parseFloat(turbidity)
          },
          date: new Date(date)
        });
      }
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  parseWaterPollutionCSV
};
