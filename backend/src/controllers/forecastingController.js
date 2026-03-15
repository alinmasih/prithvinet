const forecastingService = require('../services/forecastingService');
const csvService = require('../services/csvService');
const path = require('path');
const fs = require('fs');

// @desc    Get multi-step forecasts
// @route   GET /api/forecasting
// @access  Public (or Private depending on needs)
const getForecasts = async (req, res) => {
  try {
    const { type, stationId } = req.query;
    if (!type) {
      return res.status(400).json({ message: "Parameter 'type' (Air|Water|Noise) is required" });
    }

    const forecasts = await forecastingService.generateMultiStepForecast(type, { stationId });
    res.json(forecasts);
  } catch (error) {
    console.error("Forecasting Controller Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload CSV for forecasting context
// @route   POST /api/forecasting/upload-csv
// @access  Private
const uploadCSVContext = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }

    const filePath = req.file.path;
    const records = await csvService.parseWaterPollutionCSV(filePath);
    
    // For now, we return the parsed records so they can be sent as context in subsequent calls
    // or we could save them to a temporary collection. 
    // Given the agentic nature, we'll return a success message and the count.
    
    // Clean up file
    fs.unlinkSync(filePath);

    res.status(200).json({ 
      message: `Successfully parsed ${records.length} records from CSV`,
      records: records // UI can store this in state and send to forecasting API if needed
    });
  } catch (error) {
    console.error("CSV Upload Error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getForecasts,
  uploadCSVContext
};
