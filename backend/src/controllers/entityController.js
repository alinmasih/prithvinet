const supabase = require('../config/supabaseClient');

const getEntities = async (req, res) => {
  try {
    const { data: entities, error } = await supabase
      .from('monitoring_logs')
      .select('*')
      .eq('monitoring_type', 'Entity');
    
    if (error) throw error;
    res.json((entities || []).map(e => ({ ...e, _id: e.id, ...e.value })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEntityById = async (req, res) => {
  try {
    const { data: entity, error } = await supabase
      .from('monitoring_logs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !entity) {
      return res.status(404).json({ message: 'Entity not found' });
    }
    res.json({ ...entity, _id: entity.id, ...entity.value });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createEntity = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .insert([{
        monitoring_type: 'Entity',
        value: req.body,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({
      success: true,
      message: 'Entity created successfully',
      data: { ...data, _id: data.id }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid entity data', error: error.message });
  }
};

const updateEntity = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('monitoring_logs')
      .update({ value: req.body })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Entity not found' });
    }
    res.json({
      success: true,
      message: 'Entity updated successfully',
      data: { ...data, _id: data.id }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid entity data', error: error.message });
  }
};

const deleteEntity = async (req, res) => {
  try {
    const { error } = await supabase
      .from('monitoring_logs')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Entity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity
};
