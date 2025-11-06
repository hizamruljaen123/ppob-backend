// Library untuk generate invoice number dengan format yang berbeda berdasarkan jenis service
class InvoiceGenerator {
  // Generate invoice number berdasarkan service_code
  static generateInvoice(serviceCode) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    // Format berbeda berdasarkan jenis service
    if (serviceCode === 'PAJAK') {
      // Format: TAX-{timestamp}-{random}
      return `TAX-${timestamp}-${random}`;
    } else if (serviceCode === 'PLN') {
      // Format: PLN-{timestamp}-{random}
      return `PLN-${timestamp}-${random}`;
    } else if (serviceCode === 'PDAM') {
      // Format: PDAM-{timestamp}-{random}
      return `PDAM-${timestamp}-${random}`;
    } else if (serviceCode === 'PULSA') {
      // Format: PULSA-{timestamp}-{random}
      return `PULSA-${timestamp}-${random}`;
    } else if (serviceCode === 'PGN') {
      // Format: PGN-{timestamp}-{random}
      return `PGN-${timestamp}-${random}`;
    } else if (serviceCode === 'MUSIK') {
      // Format: MUSIK-{timestamp}-{random}
      return `MUSIK-${timestamp}-${random}`;
    } else if (serviceCode === 'TV') {
      // Format: TV-{timestamp}-{random}
      return `TV-${timestamp}-${random}`;
    } else if (serviceCode === 'PAKET_DATA') {
      // Format: DATA-{timestamp}-{random}
      return `DATA-${timestamp}-${random}`;
    } else if (serviceCode === 'VOUCHER_GAME') {
      // Format: GAME-{timestamp}-{random}
      return `GAME-${timestamp}-${random}`;
    } else if (serviceCode === 'VOUCHER_MAKANAN') {
      // Format: FOOD-{timestamp}-{random}
      return `FOOD-${timestamp}-${random}`;
    } else if (serviceCode === 'QURBAN') {
      // Format: QURBAN-{timestamp}-{random}
      return `QURBAN-${timestamp}-${random}`;
    } else if (serviceCode === 'ZAKAT') {
      // Format: ZAKAT-{timestamp}-{random}
      return `ZAKAT-${timestamp}-${random}`;
    } else {
      // Format default untuk service yang tidak dikenali
      return `INV-${timestamp}-${random}`;
    }
  }

  // Mengecek apakah invoice number sudah ada di database
  static async invoiceExists(invoiceNumber, executeQuery) {
    const sql = 'SELECT id FROM transactions WHERE invoice_number = ?';
    const transaction = await executeQuery(sql, [invoiceNumber]);
    return transaction.length > 0;
  }

  // Generate invoice number unik dengan retry
  static async generateUniqueInvoice(serviceCode, executeQuery, maxAttempts = 10) {
    let invoiceNumber;
    let isUnique = false;
    let attempts = 0;

    do {
      invoiceNumber = this.generateInvoice(serviceCode);
      isUnique = !(await this.invoiceExists(invoiceNumber, executeQuery));
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      throw new Error('Gagal generate invoice number unik');
    }

    return invoiceNumber;
  }
}

module.exports = InvoiceGenerator;