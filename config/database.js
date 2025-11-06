// Konfigurasi dan koneksi database (PostgreSQL)
const { Pool } = require('pg');
require('dotenv').config();

// Build connection string from env (prefer DATABASE_URL for serverless providers like Neon)
function buildConnFromLegacyEnv() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (DB_HOST && DB_USER && DB_NAME) {
    const user = encodeURIComponent(DB_USER);
    const pwd = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : '';
    return `postgresql://${user}${pwd}@${DB_HOST}/${DB_NAME}`;
  }
  return undefined;
}

const connectionString = process.env.DATABASE_URL || buildConnFromLegacyEnv();

// Initialize pool with SSL for Neon (serverless Postgres)
const pool = new Pool({
  connectionString,
  // Neon requires SSL; local PG usually not. DATABASE_URL presence => assume remote SSL.
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Menguji koneksi database
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database PostgreSQL berhasil terkoneksi');
    return true;
  } catch (error) {
    console.error('Koneksi database gagal:', error.message);
    return false;
  }
}

// Utility: convert "?" placeholders to $1, $2, ... for pg
function toPgParams(sql, params = []) {
  let idx = 0;
  const text = sql.replace(/\?/g, () => {
    idx += 1;
    return `$${idx}`;
  });
  return { text, params };
}

// Menjalankan query SQL
async function executeQuery(sql, params = []) {
  try {
    const { text, params: pgParams } = toPgParams(sql, params);
    const result = await pool.query(text, pgParams);
    return result.rows;
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
    // Tambahkan RETURNING id jika belum ada
    let returningSql = sql.trim();
    if (!/\breturning\b/i.test(returningSql)) {
      // Pastikan tidak ada ; di akhir sebelum menambahkan RETURNING
      returningSql = returningSql.replace(/;?$/, ' RETURNING id');
    }
    const { text, params: pgParams } = toPgParams(returningSql, params);
    const result = await pool.query(text, pgParams);
    const row = result.rows && result.rows[0];
    return row ? row.id : null;
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