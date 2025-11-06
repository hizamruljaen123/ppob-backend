// Controller untuk menangani operasi profile user
const User = require('../models/User');
const { isValidImageFormat } = require('../utils/validation');
const multer = require('multer');
const path = require('path');

 // Konfigurasi multer untuk upload gambar (in-memory, akan di-upload ke Dropbox)
const storage = multer.memoryStorage();

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

 // Fungsi untuk mengupload gambar profile (upload ke Dropbox)
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

    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('DROPBOX_ACCESS_TOKEN is missing');
    }

    // Tentukan path file di Dropbox
    const ext = path.extname(req.file.originalname)?.toLowerCase() || '.jpg';
    const timestamp = Date.now();
    const dropboxPath = `/profile-images/${email}-${timestamp}${ext}`;

    const dropboxArgs = {
      autorename: false,
      mode: 'add',
      mute: false,
      path: dropboxPath,
      strict_conflict: false
    };

    // Upload file ke Dropbox Content API
    const uploadResp = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify(dropboxArgs),
        'Content-Type': 'application/octet-stream'
      },
      body: req.file.buffer
    });

    if (!uploadResp.ok) {
      let bodyText = await uploadResp.text();
      try {
        const errJson = JSON.parse(bodyText);
        if (
          uploadResp.status === 401 &&
          ((errJson.error && errJson.error['.tag'] === 'missing_scope') ||
            (errJson.error_summary && errJson.error_summary.includes('missing_scope')))
        ) {
          const required = (errJson.error && errJson.error.required_scope) || 'files.content.write';
          return res.status(500).json({
            status: 500,
            message: `Konfigurasi Dropbox tidak memiliki scope yang dibutuhkan: ${required}. Mohon regenerasi Access Token dengan scope tersebut (contoh: files.content.write).`,
            data: null
          });
        }
      } catch (_) {}
      throw new Error(`Dropbox upload failed: ${uploadResp.status} ${bodyText}`);
    }
    const uploadJson = await uploadResp.json();

    // Dapatkan temporary link agar bisa diakses sebagai URL
    let imageUrl = null;
    try {
      const linkResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: uploadJson.path_lower || dropboxPath })
      });

      if (!linkResp.ok) {
        let linkText = await linkResp.text();
        try {
          const linkErr = JSON.parse(linkText);
          if (
            linkResp.status === 401 &&
            ((linkErr.error && linkErr.error['.tag'] === 'missing_scope') ||
              (linkErr.error_summary && linkErr.error_summary.includes('missing_scope')))
          ) {
            console.error('Dropbox temporary link missing scope:', (linkErr.error && linkErr.error.required_scope) || 'files.content.read');
          }
        } catch (__) {
          // ignore parse error
        }
      } else {
        const linkJson = await linkResp.json();
        imageUrl = linkJson.link;
      }
    } catch (_) {
      // Abaikan, fallback di bawah
    }

    // Fallback bila gagal dapat temporary link
    if (!imageUrl) {
      imageUrl = `dropbox:${uploadJson.path_lower || dropboxPath}`;
    }

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

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 102,
        message: 'Ukuran file terlalu besar',
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