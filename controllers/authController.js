// Controller untuk menangani autentikasi (login dan registrasi)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isValidEmail, isValidPassword } = require('../utils/validation');

// Fungsi untuk registrasi user baru
const register = async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body;

    // Validasi input - semua parameter harus ada
    if (!email || !first_name || !last_name || !password) {
      return res.status(400).json({
        status: 102,
        message: 'Semua parameter diperlukan (email, first_name, last_name, password)',
        data: null
      });
    }

    // Validasi format email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter email tidak sesuai format',
        data: null
      });
    }

    // Validasi panjang password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter password minimal 8 karakter',
        data: null
      });
    }

    // Mengecek apakah email sudah terdaftar
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        status: 102,
        message: 'Email sudah terdaftar',
        data: null
      });
    }

    // Hash password sebelum menyimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Menyimpan user baru ke database menggunakan model
    const userId = await User.create({
      email,
      first_name,
      last_name,
      password: hashedPassword
    });

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Registrasi berhasil silahkan login',
      data: null
    });

  } catch (error) {
    console.error('Error registrasi:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

// Fungsi untuk login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input - email dan password harus ada
    if (!email || !password) {
      return res.status(400).json({
        status: 102,
        message: 'Email dan password diperlukan',
        data: null
      });
    }

    // Validasi format email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter email tidak sesuai format',
        data: null
      });
    }

    // Validasi panjang password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter password minimal 8 karakter',
        data: null
      });
    }

    // Mencari user berdasarkan email menggunakan model
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null
      });
    }

    // Memverifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 103,
        message: 'Username atau password salah',
        data: null
      });
    }

    // Membuat JWT token dengan masa berlaku 12 jam
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '12h' }
    );

    // Mengembalikan response sukses dengan token
    res.status(200).json({
      status: 0,
      message: 'Login Sukses',
      data: {
        token: token
      }
    });

  } catch (error) {
    console.error('Error login:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

module.exports = {
  register,
  login
};