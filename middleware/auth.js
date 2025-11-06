// Middleware untuk autentikasi JWT
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware untuk memverifikasi token JWT
const authenticateToken = async (req, res, next) => {
  try {
    // Mengambil token dari header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak valid atau kadaluwarsa',
        data: null
      });
    }

    // Memverifikasi token JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret);

    // Mengecek apakah user masih ada di database menggunakan model
    const user = await User.findByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak valid atau kadaluwarsa',
        data: null
      });
    }

    // Menyimpan informasi user ke request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error autentikasi:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 108,
        message: 'Token tidak valid atau kadaluwarsa',
        data: null
      });
    }

    return res.status(401).json({
      status: 108,
      message: 'Token tidak valid atau kadaluwarsa',
      data: null
    });
  }
};

module.exports = {
  authenticateToken
};