const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getForecasts, uploadCSVContext } = require('../controllers/forecastingController');
const { protect } = require('../middleware/authMiddleware');

// Multer setup for CSV uploads
const upload = multer({ dest: 'uploads/' });

router.get('/', getForecasts);
router.post('/upload-csv', protect, upload.single('csv'), uploadCSVContext);

module.exports = router;
