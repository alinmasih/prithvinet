const supabase = require('../config/supabaseClient');

// @desc    Submit industrial inspection log
// @route   POST /api/inspections
// @access  Private (Monitoring Team / Field Inspector)
const submitInspection = async (req, res) => {
  try {
    const { industry, inspection_date, compliance_status, violations, remarks, photos } = req.body;

    const { data: inspection, error: insError } = await supabase
      .from('monitoring_logs')
      .insert([{
        monitoring_type: 'Inspection',
        location: industry, // Referencing industry ID as location for logs
        value: { compliance_status, violations, photos, industry_id: industry },
        remarks: remarks,
        submitted_by: req.user.id || req.user._id,
        timestamp: inspection_date || new Date().toISOString()
      }])
      .select()
      .single();

    if (insError) throw insError;

    // Update industry status based on inspection
    await supabase
      .from('industries')
      .update({ approval_status: compliance_status === 'Compliant' ? 'Approved' : 'Action Required' })
      .eq('id', industry);

    res.status(201).json({ ...inspection, _id: inspection.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inspections
// @route   GET /api/inspections
// @access  Private
const getInspections = async (req, res) => {
  try {
    let query = supabase
      .from('monitoring_logs')
      .select('*, submitted_by:users(name)')
      .eq('monitoring_type', 'Inspection')
      .order('timestamp', { ascending: false });
    
    // Role-based filtering
    if (req.user.role === 'Monitoring Team') {
      query = query.eq('submitted_by', req.user.id || req.user._id);
    }

    const { data: inspections, error } = await query;
    if (error) throw error;
    
    // In search of industry names
    const industryIds = [...new Set((inspections || []).map(i => i.value?.industry_id))].filter(Boolean);
    const { data: industries } = await supabase.from('industries').select('id, industry_name').in('id', industryIds);
    const industryMap = (industries || []).reduce((acc, ind) => ({ ...acc, [ind.id]: ind }), {});

    res.json((inspections || []).map(i => ({
      ...i,
      _id: i.id,
      industry: industryMap[i.value?.industry_id] ? { _id: i.value.industry_id, industry_name: industryMap[i.value.industry_id].industry_name } : null,
      inspector: i.submitted_by,
      inspection_date: i.timestamp,
      compliance_status: i.value?.compliance_status,
      remarks: i.remarks
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitInspection, getInspections };
