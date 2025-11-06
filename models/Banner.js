// Model untuk operasi database terkait Banner
const { executeQuery } = require('../config/database');

class Banner {
  // Mengambil semua banner
  static async findAll() {
    const sql = 'SELECT banner_name, banner_image, description FROM banners ORDER BY id ASC';
    return await executeQuery(sql);
  }

  // Mengambil banner berdasarkan ID
  static async findById(id) {
    const sql = 'SELECT banner_name, banner_image, description FROM banners WHERE id = ?';
    const banners = await executeQuery(sql, [id]);
    return banners.length > 0 ? banners[0] : null;
  }
}

module.exports = Banner;