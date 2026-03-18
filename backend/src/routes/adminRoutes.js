const express = require('express');
const router = express.Router();
const { 
  getIndustriesForApproval, 
  approveIndustry, 
  createRegionalOfficer,
  getRegionalOffices,
  getMonitoringTeams,
  getAllIndustries
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/industries', getIndustriesForApproval);
router.post('/approve-industry', approveIndustry);
router.post('/create-regional-officer', createRegionalOfficer);
router.get('/regional-offices', getRegionalOffices);
router.get('/monitoring-teams', getMonitoringTeams);
router.get('/all-industries', getAllIndustries);

module.exports = router;
