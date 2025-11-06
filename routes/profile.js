// Routes untuk operasi profile user
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getProfile, updateProfile, uploadProfileImage, upload } = require('../controllers/profileController');

// Route untuk mendapatkan profile user
// GET /profile
// Private endpoint - memerlukan token JWT
router.get('/profile', authenticateToken, getProfile);

// Route untuk mengupdate profile user
// PUT /profile/update
// Private endpoint - memerlukan token JWT
router.put('/profile/update', authenticateToken, updateProfile);

// Route untuk mengupload gambar profile
// PUT /profile/image
// Private endpoint - memerlukan token JWT
// Menggunakan multer middleware untuk handle file upload
router.put('/profile/image', authenticateToken, upload.single('file'), uploadProfileImage);

module.exports = router;