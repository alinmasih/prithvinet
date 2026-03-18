const supabase = require('../config/supabaseClient');

const getCampaigns = async (req, res) => {
  try {
    const { data: campaigns, error } = await supabase
      .from('monitoring_logs')
      .select('*')
      .eq('monitoring_type', 'Campaign');
    
    if (error) throw error;
    res.json((campaigns || []).map(c => ({ ...c, _id: c.id, ...c.value })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createCampaign = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .insert([{
        monitoring_type: 'Campaign',
        value: req.body,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ ...data, _id: data.id });
  } catch (error) {
    res.status(400).json({ message: 'Invalid campaign data', error: error.message });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .update({
        value: req.body,
        timestamp: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ ...data, _id: data.id });
  } catch (error) {
    res.status(400).json({ message: 'Error updating campaign', error: error.message });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  updateCampaign
};
