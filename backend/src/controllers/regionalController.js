const User = require('../models/User');
const Industry = require('../models/Industry');
const MonitoringTeam = require('../models/MonitoringTeam');
const RegionalOffice = require('../models/RegionalOffice');

// @desc    Get industries in Regional Officer's jurisdiction
// @route   GET /api/regional/industries
// @access  Private/Regional Officer
const getMyJurisdictionIndustries = async (req, res) => {
  try {
    const targetOfficeId = req.query.officeId || (req.user.role === 'Regional Officer' ? req.user.assigned_region : null);
    
    const query = {};
    if (targetOfficeId) {
      query.assigned_region = targetOfficeId;
    }
    
    // Fallback: If no office ID and is RO, use RO's ID linkage
    if (!targetOfficeId && req.user.role === 'Regional Officer') {
      query.regional_officer_id = req.user._id;
    }

    const industries = await Industry.find(query);
    res.json(industries);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Create a monitoring team
// @route   POST /api/regional/create-monitoring-team
// @access  Private/Regional Officer
const createMonitoringTeam = async (req, res) => {
  const { team_name, memberIds } = req.body;

  try {
    const team = await MonitoringTeam.create({
      team_name,
      regional_officer_id: req.user._id,
      members: memberIds
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get RO's regional office details
// @route   GET /api/regional/office
// @access  Private/Regional Officer
const getMyRegionalOffice = async (req, res) => {
  try {
    const targetId = req.params.id || req.user.assigned_region;
    if (!targetId) return res.status(400).json({ message: 'No office ID provided' });
    
    const office = await RegionalOffice.findById(targetId);
    res.json(office);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get RO's monitoring teams
// @route   GET /api/regional/teams
// @access  Private/Regional Officer
const getMyMonitoringTeams = async (req, res) => {
  try {
    const targetOfficeId = req.query.officeId || (req.user.role === 'Regional Officer' ? req.user.assigned_region : null);
    
    let query = {};
    if (targetOfficeId) {
      // Find the RO for this office first to get teams linked to them
      const roUser = await User.findOne({ assigned_region: targetOfficeId, role: 'Regional Officer' });
      if (roUser) {
        query.regional_officer_id = roUser._id;
      } else {
        // Fallback for offices without an RO yet? 
        return res.json([]);
      }
    } else {
      query.regional_officer_id = req.user._id;
    }

    const teams = await MonitoringTeam.find(query)
      .populate('members', 'name email status');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getMyJurisdictionIndustries,
  createMonitoringTeam,
  getMyRegionalOffice,
  getMyMonitoringTeams
};
