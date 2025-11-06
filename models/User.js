// Model untuk operasi database terkait User
const { executeQuery, getSingleRow, insertRow } = require('../config/database');

class User {
  // Mencari user berdasarkan email
  static async findByEmail(email) {
    const sql = 'SELECT id, email, password, first_name, last_name, profile_image, balance FROM users WHERE email = ?';
    return await getSingleRow(sql, [email]);
  }

  // Mencari user berdasarkan ID
  static async findById(id) {
    const sql = 'SELECT id, email, first_name, last_name, profile_image, balance FROM users WHERE id = ?';
    return await getSingleRow(sql, [id]);
  }

  // Membuat user baru
  static async create(userData) {
    const { email, first_name, last_name, password } = userData;
    const sql = 'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)';
    const insertId = await insertRow(sql, [email, first_name, last_name, password]);
    return insertId;
  }

  // Mengupdate data user berdasarkan ID
  static async update(id, updateData) {
    const { first_name, last_name, profile_image } = updateData;
    let sql = 'UPDATE users SET';
    const params = [];
    const updates = [];

    if (first_name !== undefined) {
      updates.push(' first_name = ?');
      params.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push(' last_name = ?');
      params.push(last_name);
    }
    if (profile_image !== undefined) {
      updates.push(' profile_image = ?');
      params.push(profile_image);
    }

    if (updates.length === 0) return false;

    sql += updates.join(',') + ' WHERE id = ?';
    params.push(id);

    await executeQuery(sql, params);
    return true;
  }

  // Mengupdate data user berdasarkan email
  static async updateByEmail(email, updateData) {
    const { first_name, last_name, profile_image } = updateData;
    let sql = 'UPDATE users SET';
    const params = [];
    const updates = [];

    if (first_name !== undefined) {
      updates.push(' first_name = ?');
      params.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push(' last_name = ?');
      params.push(last_name);
    }
    if (profile_image !== undefined) {
      updates.push(' profile_image = ?');
      params.push(profile_image);
    }

    if (updates.length === 0) return false;

    sql += updates.join(',') + ' WHERE email = ?';
    params.push(email);

    await executeQuery(sql, params);
    return true;
  }

  // Mengupdate balance user
  static async updateBalance(id, newBalance) {
    const sql = 'UPDATE users SET balance = ? WHERE id = ?';
    await executeQuery(sql, [newBalance, id]);
    return true;
  }

  // Mengecek apakah email sudah terdaftar
  static async emailExists(email) {
    const sql = 'SELECT id FROM users WHERE email = ?';
    const user = await getSingleRow(sql, [email]);
    return user !== null;
  }
}

module.exports = User;