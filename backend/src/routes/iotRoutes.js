const express = require('express');
const router = express.Router();
const { getLatestSensorData } = require('../controllers/iotController');

router.get('/latest', getLatestSensorData);

module.exports = router;
