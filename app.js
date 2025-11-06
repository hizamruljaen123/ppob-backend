// File utama aplikasi Express.js untuk SIMS PPOB API
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const informationRoutes = require('./routes/information');
const transactionRoutes = require('./routes/transaction');

// Membuat instance aplikasi Express
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Middleware untuk parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware CORS untuk mengizinkan request dari domain lain
app.use(cors());

// Middleware untuk serve file statis (gambar profile dan public files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Menggunakan routes
app.use('/', authRoutes); // Routes untuk autentikasi
app.use('/', profileRoutes); // Routes untuk profile
app.use('/', informationRoutes); // Routes untuk informasi (banner dan services)
app.use('/', transactionRoutes); // Routes untuk transaksi (balance, topup, transaction, history)

// Route untuk API README
app.get('/api/readme', async (req, res) => {
  try {
    const { marked } = await import('marked');
    const readmePath = path.join(__dirname, 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const htmlContent = marked.parse(readmeContent);

    res.json({
      status: 0,
      message: 'README content retrieved successfully',
      data: {
        content: htmlContent
      }
    });
  } catch (error) {
    console.error('Error reading README.md:', error);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan saat memuat dokumentasi',
      data: null
    });
  }
});

// Route untuk menampilkan halaman dokumentasi utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware untuk menangani error 404 (route tidak ditemukan)
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Endpoint tidak ditemukan',
    data: null
  });
});

// Middleware untuk menangani error global
app.use((error, req, res, next) => {
  console.error('Error global:', error.message);

  // Menangani error multer (upload file)
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
});

// Mengatur port server
const PORT = process.env.PORT || 3000;

// Fungsi untuk memulai server
const startServer = async () => {
  try {
    // Menguji koneksi database sebelum memulai server
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Tidak dapat terhubung ke database. Server tidak akan dimulai.');
      process.exit(1);
    }

    // Memulai server
    app.listen(PORT, () => {
      console.log(`Server berjalan di port ${PORT}`);
      console.log(`API dapat diakses di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error memulai server:', error.message);
    process.exit(1);
  }
};

// Memulai server
startServer();

module.exports = app;