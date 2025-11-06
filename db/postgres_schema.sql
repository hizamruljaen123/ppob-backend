-- PostgreSQL schema for SIMS PPOB (converted from MySQL)
-- Compatible with Neon serverless Postgres

BEGIN;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(500),
  balance NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  service_code VARCHAR(50) NOT NULL UNIQUE,
  service_name VARCHAR(255) NOT NULL,
  service_icon VARCHAR(500) NOT NULL,
  service_tariff NUMERIC(15,2) NOT NULL,
  service_type VARCHAR(50),
  service_type_name VARCHAR(255),
  admin_fee NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('TOPUP','PAYMENT')),
  service_code VARCHAR(50) REFERENCES services(service_code) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  admin_fee NUMERIC(15,2) DEFAULT 0,
  created_on TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_service_code_idx ON transactions(service_code);

-- Detail tables
CREATE TABLE IF NOT EXISTS transaction_details_pajak (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT,
  nop VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_pln (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  meter_number VARCHAR(50) NOT NULL,
  nominal NUMERIC(15,2) NOT NULL,
  token_listrik VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS transaction_details_pdam (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  no_pelanggan VARCHAR(50) NOT NULL,
  periode VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_pulsa (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  nomor_hp VARCHAR(20) NOT NULL,
  nominal NUMERIC(15,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_pgn (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  id_pelanggan VARCHAR(50) NOT NULL,
  periode VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_musik (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  paket VARCHAR(100) NOT NULL,
  periode VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_tv (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  id_pelanggan VARCHAR(50) NOT NULL,
  paket VARCHAR(100) NOT NULL,
  periode VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_paket_data (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  nomor_hp VARCHAR(20) NOT NULL,
  paket_data VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_voucher_game (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  game_id VARCHAR(100) NOT NULL,
  nominal NUMERIC(15,2) NOT NULL,
  kode_voucher VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS transaction_details_voucher_makanan (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  nominal NUMERIC(15,2) NOT NULL,
  kode_voucher VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS transaction_details_qurban (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  jenis_hewan VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_details_zakat (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  jenis_zakat VARCHAR(100) NOT NULL,
  nominal NUMERIC(15,2) NOT NULL
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  banner_name VARCHAR(255) NOT NULL,
  banner_image VARCHAR(500) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;