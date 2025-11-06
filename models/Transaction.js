// Model untuk operasi database terkait Transaction
const { executeQuery, getSingleRow, insertRow } = require('../config/database');
const InvoiceGenerator = require('../utils/invoiceGenerator');

class Transaction {
  // Mengambil balance user berdasarkan user_id
  static async getBalance(userId) {
    const sql = 'SELECT balance FROM users WHERE id = ?';
    const user = await getSingleRow(sql, [userId]);
    return user ? user.balance : 0;
  }

  // Mengupdate balance user
  static async updateBalance(userId, newBalance) {
    const sql = 'UPDATE users SET balance = ? WHERE id = ?';
    await executeQuery(sql, [newBalance, userId]);
    return true;
  }

  // Membuat transaksi baru
  static async create(transactionData) {
    const { user_id, invoice_number, transaction_type, service_code, description, total_amount, admin_fee } = transactionData;
    const sql = `INSERT INTO transactions
                 (user_id, invoice_number, transaction_type, service_code, description, total_amount, admin_fee)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const insertId = await insertRow(sql, [user_id, invoice_number, transaction_type, service_code, description, total_amount, admin_fee || 0]);

    // Jika ada detail transaksi, simpan ke tabel detail sesuai service
    if (transactionData.details) {
      await this.saveTransactionDetails(insertId, service_code, transactionData.details);
    }

    return insertId;
  }

  // Simpan detail transaksi ke tabel spesifik berdasarkan service_code
  static async saveTransactionDetails(transactionId, serviceCode, details) {
    let tableName, columns, values;

    switch (serviceCode) {
      case 'PAJAK':
        tableName = 'transaction_details_pajak';
        columns = ['transaction_id', 'customer_name', 'customer_address', 'nop'];
        values = [transactionId, details.customer_name, details.customer_address, details.nop];
        break;
      case 'PLN':
        tableName = 'transaction_details_pln';
        columns = ['transaction_id', 'customer_name', 'meter_number', 'nominal', 'token_listrik'];
        values = [transactionId, details.customer_name, details.meter_number, details.nominal, details.token_listrik];
        break;
      case 'PDAM':
        tableName = 'transaction_details_pdam';
        columns = ['transaction_id', 'customer_name', 'no_pelanggan', 'periode'];
        values = [transactionId, details.customer_name, details.no_pelanggan, details.periode];
        break;
      case 'PULSA':
        tableName = 'transaction_details_pulsa';
        columns = ['transaction_id', 'customer_name', 'nomor_hp', 'nominal'];
        values = [transactionId, details.customer_name, details.nomor_hp, details.nominal];
        break;
      case 'PGN':
        tableName = 'transaction_details_pgn';
        columns = ['transaction_id', 'customer_name', 'id_pelanggan', 'periode'];
        values = [transactionId, details.customer_name, details.id_pelanggan, details.periode];
        break;
      case 'MUSIK':
        tableName = 'transaction_details_musik';
        columns = ['transaction_id', 'customer_name', 'paket', 'periode'];
        values = [transactionId, details.customer_name, details.paket, details.periode];
        break;
      case 'TV':
        tableName = 'transaction_details_tv';
        columns = ['transaction_id', 'customer_name', 'id_pelanggan', 'paket', 'periode'];
        values = [transactionId, details.customer_name, details.id_pelanggan, details.paket, details.periode];
        break;
      case 'PAKET_DATA':
        tableName = 'transaction_details_paket_data';
        columns = ['transaction_id', 'customer_name', 'nomor_hp', 'paket_data'];
        values = [transactionId, details.customer_name, details.nomor_hp, details.paket_data];
        break;
      case 'VOUCHER_GAME':
        tableName = 'transaction_details_voucher_game';
        columns = ['transaction_id', 'customer_name', 'game_id', 'nominal', 'kode_voucher'];
        values = [transactionId, details.customer_name, details.game_id, details.nominal, details.kode_voucher];
        break;
      case 'VOUCHER_MAKANAN':
        tableName = 'transaction_details_voucher_makanan';
        columns = ['transaction_id', 'customer_name', 'merchant', 'nominal', 'kode_voucher'];
        values = [transactionId, details.customer_name, details.merchant, details.nominal, details.kode_voucher];
        break;
      case 'QURBAN':
        tableName = 'transaction_details_qurban';
        columns = ['transaction_id', 'customer_name', 'jenis_hewan'];
        values = [transactionId, details.customer_name, details.jenis_hewan];
        break;
      case 'ZAKAT':
        tableName = 'transaction_details_zakat';
        columns = ['transaction_id', 'customer_name', 'jenis_zakat', 'nominal'];
        values = [transactionId, details.customer_name, details.jenis_zakat, details.nominal];
        break;
      default:
        return; // Tidak ada detail untuk service ini
    }

    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    await executeQuery(sql, values);
  }

  // Mengambil history transaksi user dengan pagination
  static async getHistory(userId, offset = 0, limit = null) {
    let sql = `SELECT invoice_number, transaction_type, description, total_amount, created_on
               FROM transactions
               WHERE user_id = ?
               ORDER BY created_on DESC`;

    const params = [userId];

    if (limit !== null && limit > 0) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const records = await executeQuery(sql, params);

    // Mengambil total records untuk pagination info
    const countSql = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
    const countResult = await getSingleRow(countSql, [userId]);
    const totalRecords = countResult.total;

    return {
      offset: parseInt(offset),
      limit: limit ? parseInt(limit) : totalRecords,
      records: records,
      total: totalRecords
    };
  }

  // Mengecek apakah invoice number sudah ada
  static async invoiceExists(invoiceNumber) {
    const sql = 'SELECT id FROM transactions WHERE invoice_number = ?';
    const transaction = await getSingleRow(sql, [invoiceNumber]);
    return transaction !== null;
  }

  // Generate invoice number unik berdasarkan service_code
  static async generateInvoiceNumber(serviceCode) {
    return await InvoiceGenerator.generateUniqueInvoice(serviceCode, executeQuery);
  }
}

module.exports = Transaction;