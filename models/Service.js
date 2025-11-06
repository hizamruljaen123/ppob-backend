// Model untuk operasi database terkait Service/Layanan
const { executeQuery, getSingleRow } = require('../config/database');

class Service {
  // Mengambil semua services
  static async findAll() {
    const sql = 'SELECT service_code, service_name, service_icon, service_tariff, service_type, service_type_name, admin_fee FROM services ORDER BY id ASC';
    return await executeQuery(sql);
  }

  // Mengambil service berdasarkan service_code
  static async findByCode(serviceCode) {
    const sql = 'SELECT service_code, service_name, service_icon, service_tariff, service_type, service_type_name, admin_fee FROM services WHERE service_code = ?';
    return await getSingleRow(sql, [serviceCode]);
  }

  // Mengecek apakah service code ada
  static async exists(serviceCode) {
    const service = await this.findByCode(serviceCode);
    return service !== null;
  }
}

module.exports = Service;