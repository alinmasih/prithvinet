const db = require('../config/localDb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Helper to map industry
const mapIndustry = (ind) => {
  if (!ind) return null;
  return {
    ...ind,
    _id: ind.id,
    industryName: ind.industry_name,
    industryType: ind.industry_type,
    location: {
      type: 'Point',
      coordinates: [ind.location_lng || 81.63, ind.location_lat || 21.25]
    },
    regional_officer_id: ind.officer_name ? { name: ind.officer_name, _id: ind.regional_officer_id } : ind.regional_officer_id
  };
};

// @desc    Get all industries pending approval
// @route   GET /api/admin/industries
// @access  Private/Admin
const getIndustriesForApproval = async (req, res) => {
  try {
    const industries = db.prepare(`
      SELECT industries.*, users.name as officer_name 
      FROM industries
      LEFT JOIN users ON industries.regional_officer_id = users.id
      WHERE industries.approval_status = 'Pending'
    `).all();

    res.json(industries.map(mapIndustry));
  } catch (error) {
    console.error('getIndustriesForApproval error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve or Reject industry registration
// @route   POST /api/admin/approve-industry
// @access  Private/Admin
const approveIndustry = async (req, res) => {
  const { industryId, status, regionalOfficerId } = req.body;

  try {
    const industry = db.prepare('SELECT * FROM industries WHERE id = ?').get(industryId);
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }

    if (regionalOfficerId) {
      db.prepare('UPDATE industries SET approval_status = ?, regional_officer_id = ? WHERE id = ?')
        .run(status, regionalOfficerId, industryId);
    } else {
      db.prepare('UPDATE industries SET approval_status = ? WHERE id = ?')
        .run(status, industryId);
    }

    const updatedIndustry = db.prepare('SELECT * FROM industries WHERE id = ?').get(industryId);

    if (status === 'Approved') {
      const existingUser = db.prepare('SELECT * FROM users WHERE industry_id = ?').get(industryId);

      const tempPassword = `Prithvi@${Math.floor(1000 + Math.random() * 9000)}`;
      const salt = await bcrypt.genSalt(10);
      const hashedTempPassword = await bcrypt.hash(tempPassword, salt);

      if (!existingUser) {
        db.prepare(`
          INSERT INTO users (id, name, email, password, role, industry_id, approved_status, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          uuidv4(),
          updatedIndustry.industry_name,
          updatedIndustry.contact_email || `${updatedIndustry.industry_name.toLowerCase().replace(/\s/g, '')}@example.com`,
          hashedTempPassword,
          'Industry User',
          industryId,
          1,
          'Active'
        );
      } else {
        db.prepare('UPDATE users SET password = ?, approved_status = 1, status = ? WHERE id = ?')
          .run(hashedTempPassword, 'Active', existingUser.id);
      }

      return res.json({ 
        success: true,
        message: `Credentials ${existingUser ? 'regenerated' : 'generated'} successfully.`,
        credentials: {
          email: updatedIndustry.contact_email,
          temporaryPassword: tempPassword
        },
        industry: mapIndustry(updatedIndustry)
      });
    }

    res.json({ success: true, message: `Industry ${status} successfully`, industry: mapIndustry(updatedIndustry) });
  } catch (error) {
    console.error('approveIndustry error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Create/Authorize Regional Officer
// @route   POST /api/admin/create-regional-officer
// @access  Private/Admin
const createRegionalOfficer = async (req, res) => {
  const { name, email, password, assigned_region } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, assigned_region, approved_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, hashedPassword, 'Regional Officer', assigned_region, 1, 'Active');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      assigned_region: user.assigned_region
    });
  } catch (error) {
    console.error('createRegionalOfficer error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all regional offices
// @route   GET /api/admin/regional-offices
// @access  Private/Admin
const getRegionalOffices = async (req, res) => {
  try {
    const offices = db.prepare('SELECT * FROM regional_offices').all();
    res.json(offices.map(o => ({ ...o, _id: o.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all monitoring teams
// @route   GET /api/admin/monitoring-teams
// @access  Private/Admin
const getMonitoringTeams = async (req, res) => {
  try {
    const teams = db.prepare(`
        SELECT monitoring_teams.*, users.name as ro_name
        FROM monitoring_teams
        LEFT JOIN users ON monitoring_teams.regional_officer_id = users.id
    `).all();

    const mappedTeams = teams.map(t => {
      const members = db.prepare(`
        SELECT u.id, u.name, u.email 
        FROM monitoring_team_members m
        JOIN users u ON m.user_id = u.id
        WHERE m.team_id = ?
      `).all(t.id);

      return {
        ...t,
        _id: t.id,
        regional_officer: t.ro_name ? { name: t.ro_name, _id: t.regional_officer_id } : null,
        members: members.map(m => ({ ...m, _id: m.id }))
      };
    });

    res.json(mappedTeams);
  } catch (error) {
    console.error('getMonitoringTeams error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all industries
// @route   GET /api/admin/all-industries
// @access  Private/Admin
const getAllIndustries = async (req, res) => {
  try {
    const industries = db.prepare(`
      SELECT industries.*, users.name as officer_name 
      FROM industries
      LEFT JOIN users ON industries.regional_officer_id = users.id
    `).all();
    
    res.json(industries.map(mapIndustry));
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getIndustriesForApproval,
  approveIndustry,
  createRegionalOfficer,
  getRegionalOffices,
  getMonitoringTeams,
  getAllIndustries
};
