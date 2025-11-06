// Controller untuk menangani operasi informasi (banner dan services)
const Banner = require('../models/Banner');
const Service = require('../models/Service');

// Fungsi untuk mendapatkan list banner
// GET /banner - Public endpoint (tidak perlu token)
const getBanners = async (req, res) => {
  try {
    // Mengambil semua data banner dari database menggunakan model
    const banners = await Banner.findAll();

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: banners
    });

  } catch (error) {
    console.error('Error mendapatkan banner:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

// Fungsi untuk mendapatkan list services/layanan
// GET /services - Private endpoint (perlu token JWT)
const getServices = async (req, res) => {
  try {
    // Mengambil semua data services dari database menggunakan model
    const services = await Service.findAll();

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Sukses',
      data: services
    });

  } catch (error) {
    console.error('Error mendapatkan services:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

module.exports = {
  getBanners,
  getServices
};