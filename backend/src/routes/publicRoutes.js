const express = require('express');
const router = express.Router();
const { 
  getPublicPollutionData, 
  getPublicIndustryStatus,
  getAllRegionalOffices 
} = require('../controllers/publicController');

router.get('/pollution-data', getPublicPollutionData);
router.get('/industry-status', getPublicIndustryStatus);
router.get('/offices', getAllRegionalOffices);

module.exports = router;
