const supabase = require('../config/supabaseClient');

// @desc    Get all water sources
// @route   GET /api/water-sources
// @access  Public
const getWaterSources = async (req, res) => {
  try {
    const { data: sources, error } = await supabase
      .from('monitoring_logs')
      .select('*')
      .eq('monitoring_type', 'WaterSource');
    
    if (error) throw error;
    res.json((sources || []).map(s => ({ ...s, _id: s.id, ...s.value })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getWaterSourceById = async (req, res) => {
  try {
    const { data: source, error } = await supabase
      .from('monitoring_logs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !source) {
      return res.status(404).json({ message: 'Water source not found' });
    }
    res.json({ ...source, _id: source.id, ...source.value });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createWaterSource = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .insert([{
        monitoring_type: 'WaterSource',
        value: req.body,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({
      success: true,
      message: 'Water source registered successfully',
      data: { ...data, _id: data.id }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid water source data', error: error.message });
  }
};

const updateWaterSource = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .update({ value: req.body })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Water source not found' });
    }
    res.json({
      success: true,
      message: 'Water source updated successfully',
      data: { ...data, _id: data.id }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid water source data', error: error.message });
  }
};

const deleteWaterSource = async (req, res) => {
  try {
    const { error } = await supabase
      .from('monitoring_logs')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Water source deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getWaterSources,
  getWaterSourceById,
  createWaterSource,
  updateWaterSource,
  deleteWaterSource
};
