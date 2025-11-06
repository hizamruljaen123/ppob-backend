// Controller untuk menangani operasi profile user
const User = require('../models/User');
const { isValidImageFormat } = require('../utils/validation');
const multer = require('multer');
const path = require('path');

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder untuk menyimpan gambar
  },
  filename: function (req, file, cb) {
    // Membuat nama file unik dengan timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter untuk memastikan hanya file gambar yang diterima
const fileFilter = (req, file, cb) => {
  if (isValidImageFormat(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Format Image tidak sesuai'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batas ukuran file 5MB
  }
});

// Fungsi untuk mendapatkan profile user
const getProfile = async (req, res) => {
  try {
    // Email didapat dari JWT token (sudah diverifikasi di middleware)
    const email = req.user.email;

    // Mengambil data profile dari database menggunakan model
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User tidak ditemukan',
        data: null
      });
    }

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: user
    });

  } catch (error) {
    console.error('Error mendapatkan profile:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

// Fungsi untuk mengupdate profile user
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    const email = req.user.email;

    // Validasi input
    if (!first_name || !last_name) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter tidak lengkap',
        data: null
      });
    }

    // Mengupdate data profile di database menggunakan model
    await User.updateByEmail(email, { first_name, last_name });

    // Mengambil data profile yang sudah diupdate menggunakan model
    const updatedUser = await User.findByEmail(email);

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Update Pofile berhasil',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error update profile:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

// Fungsi untuk mengupload gambar profile
const uploadProfileImage = async (req, res) => {
  try {
    const email = req.user.email;

    // Mengecek apakah file berhasil diupload
    if (!req.file) {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null
      });
    }

    // Path lengkap untuk gambar yang diupload
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Mengupdate profile_image di database menggunakan model
    await User.updateByEmail(email, { profile_image: imageUrl });

    // Mengambil data profile yang sudah diupdate menggunakan model
    const updatedUser = await User.findByEmail(email);

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Update Profile Image berhasil',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error upload profile image:', error.message);

    if (error.message === 'Format Image tidak sesuai') {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null
      });
    }

    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  upload
};