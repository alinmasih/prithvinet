const express = require('express');
const router = express.Router();
const { 
  getMyJurisdictionIndustries,
  createMonitoringTeam,
  getMyRegionalOffice,
  getMyMonitoringTeams
} = require('../controllers/regionalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin', 'Regional Officer'));

router.get('/industries', getMyJurisdictionIndustries);
router.get('/office', getMyRegionalOffice);
router.get('/office/:id', getMyRegionalOffice);
router.get('/teams', getMyMonitoringTeams);
router.post('/create-monitoring-team', createMonitoringTeam);

module.exports = router;
