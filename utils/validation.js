// Utility functions untuk validasi input

// Validasi format email menggunakan regex sederhana
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validasi panjang password minimal 8 karakter
function isValidPassword(password) {
  return password && password.length >= 8;
}

// Validasi bahwa nilai adalah angka dan tidak negatif
function isValidAmount(amount) {
  return !isNaN(amount) && amount >= 0;
}

// Validasi format gambar (hanya jpeg dan png)
function isValidImageFormat(filename) {
  if (!filename) return false;
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(fileExtension);
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidAmount,
  isValidImageFormat
};