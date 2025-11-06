// Konfigurasi dan koneksi database
const mysql = require('mysql2/promise');
require('dotenv').config();

// Membuat connection pool untuk performa yang lebih baik
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sims_ppob',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Menguji koneksi database
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database berhasil terkoneksi');
    connection.release();
    return true;
  } catch (error) {
    console.error('Koneksi database gagal:', error.message);
    return false;
  }
}

// Menjalankan query SQL mentah
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error query database:', error.message);
    throw error;
  }
}

// Mendapatkan satu baris data
async function getSingleRow(sql, params = []) {
  const rows = await executeQuery(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Menyisipkan data dan mengembalikan ID yang disisipkan
async function insertRow(sql, params = []) {
  try {
    const [result] = await pool.execute(sql, params);
    return result.insertId;
  } catch (error) {
    console.error('Error insert database:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getSingleRow,
  insertRow
};