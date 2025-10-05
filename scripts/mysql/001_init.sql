-- Create database (optional if you already have one)
-- CREATE DATABASE IF NOT EXISTS escrow_app;
-- USE escrow_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders table (dashboards + escrow)
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NULL,
  seller_name VARCHAR(255) NULL,
  buyer_wallet VARCHAR(100) NOT NULL,
  seller_wallet VARCHAR(100) NOT NULL,
  amount_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('locked','released','refunded','delivered','shipped','pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  progress TINYINT NOT NULL DEFAULT 0,
  delivery_status VARCHAR(50) NULL,
  escrow_hash VARCHAR(100) NULL,
  estimated_release_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_buyer_wallet (buyer_wallet),
  INDEX idx_seller_wallet (seller_wallet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
