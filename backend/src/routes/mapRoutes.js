const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

/**
 * GET /api/map/environmental-data
 * Returns recent monitoring logs for map visualization
 */
router.get('/environmental-data', async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('monitoring_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    const air = logs.filter(l => l.monitoring_type === 'Air').map(l => ({ ...l, ...l.value, _id: l.id }));
    const water = logs.filter(l => l.monitoring_type === 'Water').map(l => ({ ...l, ...l.value, _id: l.id }));
    const noise = logs.filter(l => l.monitoring_type === 'Noise').map(l => ({ ...l, ...l.value, _id: l.id }));
    
    res.json({ air, water, noise });
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
    const { data: industries, error } = await supabase
      .from('industries')
      .select('*');

    if (error) throw error;
    res.json((industries || []).map(ind => ({ ...ind, _id: ind.id })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching industry data', error: error.message });
  }
});

/**
 * GET /api/map/details
 * Returns data for simple search-like behavior
 */
router.get('/details', async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude and Longitude are required' });
  }

  try {
    // PostGIS nearest neighbor would be better, but for this migration we will use simplified distance filter or just fetch recent near Raipur center
    // For now, let's fetch most recent per type as a simplified 'nearest' equivalent
    const { data: airLogs } = await supabase.from('monitoring_logs').select('*').eq('monitoring_type', 'Air').order('timestamp', { ascending: false }).limit(1);
    const { data: waterLogs } = await supabase.from('monitoring_logs').select('*').eq('monitoring_type', 'Water').order('timestamp', { ascending: false }).limit(1);
    const { data: noiseLogs } = await supabase.from('monitoring_logs').select('*').eq('monitoring_type', 'Noise').order('timestamp', { ascending: false }).limit(1);
    
    const { data: nearbyIndustries } = await supabase.from('industries').select('*').limit(5);

    res.json({
      metrics: {
        air: airLogs?.[0] ? { ...airLogs[0], ...airLogs[0].value, _id: airLogs[0].id } : null,
        water: waterLogs?.[0] ? { ...waterLogs[0], ...waterLogs[0].value, _id: waterLogs[0].id } : null,
        noise: noiseLogs?.[0] ? { ...noiseLogs[0], ...noiseLogs[0].value, _id: noiseLogs[0].id } : null
      },
      nearbyIndustries: (nearbyIndustries || []).map(ind => ({
        id: ind.id,
        _id: ind.id,
        name: ind.industry_name,
        type: ind.industry_type,
        emission_factor: ind.emission_factor,
        location: {
            type: 'Point',
            coordinates: [ind.location_lng, ind.location_lat]
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching location details', error: error.message });
  }
});

module.exports = router;
