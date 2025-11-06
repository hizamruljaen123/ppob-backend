// Routes untuk operasi transaksi (balance, topup, transaction, history)
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getBalance,
  topupBalance,
  createTransaction,
  getTransactionHistory
} = require('../controllers/transactionController');

// Route untuk mendapatkan balance user
// GET /balance
// Private endpoint - memerlukan token JWT
router.get('/balance', authenticateToken, getBalance);

// Route untuk melakukan topup balance
// POST /topup
// Private endpoint - memerlukan token JWT
router.post('/topup', authenticateToken, topupBalance);

// Route untuk melakukan transaksi pembayaran service
// POST /transaction
// Private endpoint - memerlukan token JWT
router.post('/transaction', authenticateToken, createTransaction);

// Route untuk mendapatkan history transaksi
// GET /transaction/history
// Private endpoint - memerlukan token JWT
// Query parameters: offset (default: 0), limit (optional)
router.get('/transaction/history', authenticateToken, getTransactionHistory);

module.exports = router;