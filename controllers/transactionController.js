// Controller untuk menangani operasi transaksi (balance, topup, transaction, history)
const User = require('../models/User');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const { isValidAmount } = require('../utils/validation');


// Fungsi untuk mendapatkan balance user
// GET /balance - Private endpoint (perlu token JWT)
const getBalance = async (req, res) => {
  try {
    // User ID didapat dari JWT token (sudah diverifikasi di middleware)
    const userId = req.user.id;

    // Mengambil balance dari database menggunakan model
    const balance = await Transaction.getBalance(userId);

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Get Balance Berhasil',
      data: {
        balance: balance
      }
    });

  } catch (error) {
    console.error('Error mendapatkan balance:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

// Fungsi untuk melakukan topup balance
// POST /topup - Private endpoint (perlu token JWT)
const topupBalance = async (req, res) => {
  try {
    const { top_up_amount } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!top_up_amount) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
        data: null
      });
    }

    // Validasi format amount
    if (!isValidAmount(top_up_amount)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
        data: null
      });
    }

    // Mengambil balance saat ini
    const currentBalance = await Transaction.getBalance(userId);

    // Menghitung balance baru
    const newBalance = parseFloat(currentBalance) + parseFloat(top_up_amount);

    // Update balance di database
    await Transaction.updateBalance(userId, newBalance);

    // Generate invoice number untuk topup (menggunakan format default)
    let invoiceNumber;
    try {
      invoiceNumber = await Transaction.generateInvoiceNumber('TOPUP');
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Gagal generate invoice number',
        data: null
      });
    }

    // Simpan transaksi topup ke database (admin fee untuk topup adalah 0)
    await Transaction.create({
      user_id: userId,
      invoice_number: invoiceNumber,
      transaction_type: 'TOPUP',
      service_code: null,
      description: 'Top Up balance',
      total_amount: top_up_amount,
      admin_fee: 0
    });

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Top Up Balance berhasil',
      data: {
        balance: newBalance
      }
    });

  } catch (error) {
    console.error('Error topup balance:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

// Fungsi untuk melakukan transaksi pembayaran service
// POST /transaction - Private endpoint (perlu token JWT)
const createTransaction = async (req, res) => {
  try {
    const {
      service_code,
      customer_name,
      customer_address,
      nop,
      meter_number,
      no_pelanggan,
      id_pelanggan,
      nomor_hp,
      game_id,
      merchant,
      jenis_hewan,
      jenis_zakat,
      paket,
      paket_data,
      periode,
      nominal
    } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!service_code) {
      return res.status(400).json({
        status: 102,
        message: 'Service atau Layanan tidak ditemukan',
        data: null
      });
    }

    // Mengecek apakah service code valid
    const service = await Service.findByCode(service_code);
    if (!service) {
      return res.status(400).json({
        status: 102,
        message: 'Service atau Layanan tidak ditemukan',
        data: null
      });
    }

    // Tentukan jumlah transaksi berdasarkan service type
    let transactionAmount;
    if (nominal) {
      transactionAmount = parseFloat(nominal);
    } else {
      transactionAmount = parseFloat(service.service_tariff);
    }

    // Validasi nominal jika diberikan
    if (nominal && (!isValidAmount(nominal) || transactionAmount <= 0)) {
      return res.status(400).json({
        status: 102,
        message: 'Parameter nominal hanya boleh angka dan tidak boleh lebih kecil dari 0',
        data: null
      });
    }

    // Hitung total biaya termasuk admin fee
    const adminFee = parseFloat(service.admin_fee) || 0;
    const totalCost = transactionAmount + adminFee;

    // Mengambil balance user saat ini
    const currentBalance = await Transaction.getBalance(userId);

    // Mengecek apakah balance mencukupi (termasuk admin fee)
    if (parseFloat(currentBalance) < totalCost) {
      return res.status(400).json({
        status: 102,
        message: 'Balance tidak mencukupi',
        data: null
      });
    }

    // Menghitung balance baru setelah transaksi
    const newBalance = parseFloat(currentBalance) - totalCost;

    // Update balance di database
    await Transaction.updateBalance(userId, newBalance);

    // Generate invoice number unik berdasarkan service_code
    let invoiceNumber;
    try {
      invoiceNumber = await Transaction.generateInvoiceNumber(service_code);
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Gagal generate invoice number',
        data: null
      });
    }

    // Generate token/kode voucher untuk service tertentu
    let tokenListrik = null;
    let kodeVoucher = null;

    if (service_code === 'PLN') {
      // Generate token listrik
      tokenListrik = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                     Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                     Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                     Math.random().toString(36).substring(2, 6).toUpperCase();
    } else if (service_code === 'VOUCHER_GAME') {
      // Generate kode voucher game
      kodeVoucher = 'GAME-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                    Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                    Math.random().toString(36).substring(2, 6).toUpperCase();
    } else if (service_code === 'VOUCHER_MAKANAN') {
      // Generate kode voucher makanan
      kodeVoucher = 'FOOD-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                    Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                    Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    // Persiapkan data detail berdasarkan service_code
    const transactionDetails = {
      customer_name: customer_name || null,
      customer_address: customer_address || null,
      nop: nop || null,
      meter_number: meter_number || null,
      no_pelanggan: no_pelanggan || null,
      id_pelanggan: id_pelanggan || null,
      nomor_hp: nomor_hp || null,
      game_id: game_id || null,
      merchant: merchant || null,
      jenis_hewan: jenis_hewan || null,
      jenis_zakat: jenis_zakat || null,
      paket: paket || null,
      paket_data: paket_data || null,
      periode: periode || null,
      nominal: nominal || null,
      token_listrik: tokenListrik,
      kode_voucher: kodeVoucher
    };

    // Simpan transaksi ke database dengan detail lengkap
    await Transaction.create({
      user_id: userId,
      invoice_number: invoiceNumber,
      transaction_type: 'PAYMENT',
      service_code: service_code,
      description: service.service_name,
      total_amount: transactionAmount,
      admin_fee: adminFee,
      details: transactionDetails
    });

    // Customize response berdasarkan service_type dari database
    const responseServiceCode = service.service_type || service.service_code;
    const responseServiceName = service.service_type_name || service.service_name;

    // Buat response data dengan informasi tambahan
    const responseData = {
      invoice_number: invoiceNumber,
      service_code: responseServiceCode,
      service_name: responseServiceName,
      transaction_type: 'PAYMENT',
      total_amount: transactionAmount,
      admin_fee: adminFee,
      created_on: new Date().toISOString()
    };

    // Tambahkan informasi spesifik berdasarkan service
    if (customer_name) responseData.customer_name = customer_name;
    if (customer_address) responseData.customer_address = customer_address;
    if (nop) responseData.nop = nop;
    if (meter_number) responseData.meter_number = meter_number;
    if (no_pelanggan) responseData.no_pelanggan = no_pelanggan;
    if (id_pelanggan) responseData.id_pelanggan = id_pelanggan;
    if (nomor_hp) responseData.nomor_hp = nomor_hp;
    if (game_id) responseData.game_id = game_id;
    if (merchant) responseData.merchant = merchant;
    if (jenis_hewan) responseData.jenis_hewan = jenis_hewan;
    if (jenis_zakat) responseData.jenis_zakat = jenis_zakat;
    if (paket) responseData.paket = paket;
    if (paket_data) responseData.paket_data = paket_data;
    if (periode) responseData.periode = periode;
    if (nominal) responseData.nominal = nominal;
    if (tokenListrik) responseData.token_listrik = tokenListrik;
    if (kodeVoucher) responseData.kode_voucher = kodeVoucher;

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Transaksi berhasil',
      data: responseData
    });

  } catch (error) {
    console.error('Error create transaction:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

// Fungsi untuk mendapatkan history transaksi
// GET /transaction/history - Private endpoint (perlu token JWT)
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { offset = 0, limit } = req.query;

    // Validasi parameter query
    const offsetNum = parseInt(offset) || 0;
    const limitNum = limit ? parseInt(limit) : null;

    // Mengambil history transaksi menggunakan model
    const historyData = await Transaction.getHistory(userId, offsetNum, limitNum);

    // Mengembalikan response sukses
    res.status(200).json({
      status: 0,
      message: 'Get History Berhasil',
      data: historyData
    });

  } catch (error) {
    console.error('Error mendapatkan history transaksi:', error.message);
    res.status(500).json({
      status: 500,
      message: 'Terjadi kesalahan server',
      data: null
    });
  }
};

module.exports = {
  getBalance,
  topupBalance,
  createTransaction,
  getTransactionHistory
};