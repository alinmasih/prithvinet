const db = require('../config/localDb');

// @desc    Get industries in Regional Officer's jurisdiction
// @route   GET /api/regional/industries
// @access  Private/Regional Officer
const getMyJurisdictionIndustries = async (req, res) => {
  try {
    const targetOfficeId = req.query.officeId || (req.user.role === 'Regional Officer' ? req.user.assigned_region : null);
    
    let queryStr = 'SELECT * FROM industries';
    let params = [];
    
    if (targetOfficeId) {
      queryStr += ' WHERE region_id = ?';
      params.push(targetOfficeId);
    } else if (req.user.role === 'Regional Officer') {
      queryStr += ' WHERE regional_officer_id = ?';
      params.push(req.user.id || req.user._id);
    }

    const industries = db.prepare(queryStr).all(...params);

    const mapped = industries.map(ind => ({
      ...ind,
      _id: ind.id,
      industryName: ind.industry_name,
      industryType: ind.industry_type,
      approvalStatus: ind.approval_status
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Create a monitoring team
// @route   POST /api/regional/create-monitoring-team
// @access  Private/Regional Officer
const createMonitoringTeam = async (req, res) => {
  const { team_name, memberIds } = req.body;
  const teamId = require('uuid').v4();

  try {
    db.prepare(`
      INSERT INTO monitoring_teams (id, team_name, regional_officer_id)
      VALUES (?, ?, ?)
    `).run(teamId, team_name, req.user.id || req.user._id);

    if (memberIds && memberIds.length > 0) {
      const insertMember = db.prepare('INSERT INTO monitoring_team_members (team_id, user_id) VALUES (?, ?)');
      memberIds.forEach(userId => insertMember.run(teamId, userId));
    }

    const team = db.prepare('SELECT * FROM monitoring_teams WHERE id = ?').get(teamId);
    res.status(201).json({ ...team, _id: team.id });
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
    
    const office = db.prepare('SELECT * FROM regional_offices WHERE id = ?').get(targetId);

    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }
    res.json({ ...office, _id: office.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get RO's monitoring teams
// @route   GET /api/regional/teams
// @access  Private/Regional Officer
const getMyMonitoringTeams = async (req, res) => {
  try {
    const targetOfficeId = req.query.officeId || (req.user.role === 'Regional Officer' ? req.user.assigned_region : null);
    
    let roId = req.user.id || req.user._id;
    if (targetOfficeId && req.user.role !== 'Regional Officer') {
       const roUser = db.prepare('SELECT id FROM users WHERE assigned_region = ? AND role = "Regional Officer"').get(targetOfficeId);
       if (roUser) roId = roUser.id;
       else return res.json([]);
    }

    const teams = db.prepare('SELECT * FROM monitoring_teams WHERE regional_officer_id = ?').all(roId);

    const mappedTeams = teams.map(t => {
      const members = db.prepare(`
        SELECT u.id, u.name, u.email, u.status 
        FROM monitoring_team_members m
        JOIN users u ON m.user_id = u.id
        WHERE m.team_id = ?
      `).all(t.id);

      return {
        ...t,
        _id: t.id,
        members: members.map(m => ({ ...m, _id: m.id }))
      };
    });

    res.json(mappedTeams);
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
