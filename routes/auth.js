// Routes untuk autentikasi (login dan registrasi)
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Route untuk registrasi user baru
// POST /registration
// Public endpoint - tidak memerlukan token
router.post('/registration', register);

// Route untuk login user
// POST /login
// Public endpoint - tidak memerlukan token
router.post('/login', login);

module.exports = router;