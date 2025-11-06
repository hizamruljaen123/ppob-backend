// Routes untuk operasi informasi (banner dan services)
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getBanners, getServices } = require('../controllers/informationController');

// Route untuk mendapatkan list banner
// GET /banner
// Public endpoint - tidak memerlukan token
router.get('/banner', getBanners);

// Route untuk mendapatkan list services/layanan
// GET /services
// Private endpoint - memerlukan token JWT
router.get('/services', authenticateToken, getServices);

module.exports = router;