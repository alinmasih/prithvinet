const express = require('express');
const router = express.Router();
const { 
  submitComplianceStatus, 
  getComplianceReports,
  exportCompliancePDF
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/compliance')
  .get(getComplianceReports)
  .post(authorize('Industry User', 'Admin', 'Regional Officer', 'Monitoring Team'), submitComplianceStatus);

router.get('/compliance/export', authorize('Admin', 'Regional Officer'), exportCompliancePDF);

module.exports = router;
