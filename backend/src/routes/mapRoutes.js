const express = require('express');
const router = express.Router();
const AirQuality = require('../models/AirQuality');
const WaterQuality = require('../models/WaterQuality');
const NoisePollution = require('../models/NoisePollution');
const Industry = require('../models/Industry');

/**
 * GET /api/map/environmental-data
 * Returns all monitoring teams for map visualization
 */
router.get('/environmental-data', async (req, res) => {
  try {
    const [aqiData, waterData, noiseData] = await Promise.all([
      AirQuality.find({}),
      WaterQuality.find({}),
      NoisePollution.find({})
    ]);
    
    res.json({
      air: aqiData,
      water: waterData,
      noise: noiseData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching environmental data', error: error.message });
  }
});

/**
 * GET /api/map/industries
 * Returns all industries for map visualization
 */
router.get('/industries', async (req, res) => {
  try {
    const industries = await Industry.find({});
    res.json(industries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching industry data', error: error.message });
  }
});

/**
 * GET /api/map/details
 * Returns data for a specific lat/long: nearby stations and industries
 */
router.get('/details', async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  const longitude = parseFloat(lon);
  const latitude = parseFloat(lat);

  try {
    // 1. Fetch nearest AQI station (within 20km)
    const nearestAQI = await AirQuality.findOne({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 20000 // 20km
        }
      }
    });

    // 2. Fetch nearest Water station (within 20km)
    const nearestWater = await WaterQuality.findOne({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 20000
        }
      }
    });

    // 3. Fetch nearest Noise station (within 20km)
    const nearestNoise = await NoisePollution.findOne({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 20000
        }
      }
    });

    // 4. Find nearby industries (within 10km)
    const nearbyIndustries = await Industry.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 10000 // 10km
        }
      }
    });

    res.json({
      metrics: {
        air: nearestAQI,
        water: nearestWater,
        noise: nearestNoise
      },
      nearbyIndustries: nearbyIndustries.map(ind => ({
        id: ind._id,
        name: ind.industryName,
        type: ind.industryType,
        emission_factor: ind.emissionFactor,
        location: ind.location
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching location details', error: error.message });
  }
});

module.exports = router;
