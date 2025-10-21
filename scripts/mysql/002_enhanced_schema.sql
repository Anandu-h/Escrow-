-- Enhanced Database Schema for Escrow Application
-- This script creates all necessary tables, relationships, functions, triggers, and procedures

-- Use the escrow_app database
USE escrow_app;

-- Disable foreign key checks while re-creating schema to avoid drop errors
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- ENHANCED TABLES
-- =============================================

-- Users table (enhanced)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(100) NULL UNIQUE,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  phone VARCHAR(20) NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email),
  INDEX idx_wallet (wallet_address),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories table
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  parent_id INT UNSIGNED NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products table (separate from orders)
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  condition_enum ENUM('new', 'like_new', 'good', 'fair', 'poor') NOT NULL DEFAULT 'good',
  brand VARCHAR(100) NULL,
  model VARCHAR(100) NULL,
  warranty_info TEXT NULL,
  shipping_method VARCHAR(100) NULL,
  return_policy TEXT NULL,
  estimated_delivery_days INT NULL,
  images JSON NULL, -- Store image URLs/paths as JSON array
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_seller (seller_id),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_featured (is_featured),
  INDEX idx_price (price_cents),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders table (enhanced)
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  buyer_id INT UNSIGNED NOT NULL,
  seller_id INT UNSIGNED NOT NULL,
  buyer_wallet VARCHAR(100) NOT NULL,
  seller_wallet VARCHAR(100) NOT NULL,
  amount_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending', 'locked', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  progress TINYINT NOT NULL DEFAULT 0,
  delivery_status VARCHAR(50) NULL,
  tracking_number VARCHAR(100) NULL,
  escrow_hash VARCHAR(100) NULL,
  escrow_contract_address VARCHAR(100) NULL,
  estimated_delivery_date DATE NULL,
  actual_delivery_date DATE NULL,
  release_date DATE NULL,
  refund_reason TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_buyer (buyer_id),
  INDEX idx_seller (seller_id),
  INDEX idx_product (product_id),
  INDEX idx_status (status),
  INDEX idx_escrow_hash (escrow_hash),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions table (for payment tracking)
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  transaction_type ENUM('payment', 'refund', 'release', 'fee') NOT NULL,
  amount_cents INT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  blockchain_hash VARCHAR(100) NULL,
  from_address VARCHAR(100) NULL,
  to_address VARCHAR(100) NULL,
  gas_fee_cents INT NULL,
  status ENUM('pending', 'confirmed', 'failed') NOT NULL DEFAULT 'pending',
  confirmation_blocks INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_type (transaction_type),
  INDEX idx_status (status),
  INDEX idx_hash (blockchain_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications table
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NULL,
  type ENUM('order_created', 'order_updated', 'payment_received', 'payment_released', 'refund_processed', 'delivery_update', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_order (order_id),
  INDEX idx_type (type),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews table
DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  reviewer_id INT UNSIGNED NOT NULL,
  reviewee_id INT UNSIGNED NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NULL,
  comment TEXT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_order_reviewer (order_id, reviewer_id),
  INDEX idx_reviewee (reviewee_id),
  INDEX idx_rating (rating),
  INDEX idx_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Disputes table
DROP TABLE IF EXISTS disputes;
CREATE TABLE disputes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  initiator_id INT UNSIGNED NOT NULL,
  reason ENUM('item_not_received', 'item_not_as_described', 'unauthorized_transaction', 'other') NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'under_review', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  resolution TEXT NULL,
  admin_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (initiator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_initiator (initiator_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System settings table
DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_key (setting_key),
  INDEX idx_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks after tables are created
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Procedure to create a new order
DELIMITER //
DROP PROCEDURE IF EXISTS CreateOrder//
CREATE PROCEDURE CreateOrder(
  IN p_product_id INT UNSIGNED,
  IN p_buyer_id INT UNSIGNED,
  IN p_buyer_wallet VARCHAR(100),
  IN p_amount_cents INT,
  IN p_currency CHAR(3),
  IN p_escrow_hash VARCHAR(100),
  OUT p_order_id INT UNSIGNED,
  OUT p_success BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_seller_id INT UNSIGNED;
  DECLARE v_seller_wallet VARCHAR(100);
  DECLARE v_product_exists BOOLEAN DEFAULT FALSE;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    SET p_message = 'Database error occurred';
  END;

  START TRANSACTION;

  -- Check if product exists and get seller info
  SELECT seller_id, wallet_address INTO v_seller_id, v_seller_wallet
  FROM products p
  JOIN users u ON p.seller_id = u.id
  WHERE p.id = p_product_id AND p.is_active = TRUE;

  IF v_seller_id IS NULL THEN
    SET p_success = FALSE;
    SET p_message = 'Product not found or not available';
    ROLLBACK;
  ELSE
    -- Create the order
    INSERT INTO orders (
      product_id, buyer_id, seller_id, buyer_wallet, seller_wallet,
      amount_cents, currency, escrow_hash, status, progress
    ) VALUES (
      p_product_id, p_buyer_id, v_seller_id, p_buyer_wallet, v_seller_wallet,
      p_amount_cents, p_currency, p_escrow_hash, 'locked', 10
    );

    SET p_order_id = LAST_INSERT_ID();

    -- Create transaction record
    INSERT INTO transactions (
      order_id, transaction_type, amount_cents, currency,
      blockchain_hash, from_address, to_address, status
    ) VALUES (
      p_order_id, 'payment', p_amount_cents, p_currency,
      p_escrow_hash, p_buyer_wallet, v_seller_wallet, 'confirmed'
    );

    -- Create notifications
    INSERT INTO notifications (user_id, order_id, type, title, message)
    VALUES 
      (p_buyer_id, p_order_id, 'order_created', 'Order Created', 'Your order has been created and payment is locked in escrow'),
      (v_seller_id, p_order_id, 'order_created', 'New Order Received', 'You have received a new order');

    SET p_success = TRUE;
    SET p_message = 'Order created successfully';
    COMMIT;
  END IF;
END//

-- Procedure to update order status
DROP PROCEDURE IF EXISTS UpdateOrderStatus//
CREATE PROCEDURE UpdateOrderStatus(
  IN p_order_id INT UNSIGNED,
  IN p_new_status VARCHAR(20),
  IN p_progress TINYINT,
  IN p_delivery_status VARCHAR(50),
  IN p_tracking_number VARCHAR(100),
  OUT p_success BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_old_status VARCHAR(20);
  DECLARE v_buyer_id INT UNSIGNED;
  DECLARE v_seller_id INT UNSIGNED;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    SET p_message = 'Database error occurred';
  END;

  START TRANSACTION;

  -- Get current status and user IDs
  SELECT status, buyer_id, seller_id INTO v_old_status, v_buyer_id, v_seller_id
  FROM orders WHERE id = p_order_id;

  IF v_old_status IS NULL THEN
    SET p_success = FALSE;
    SET p_message = 'Order not found';
    ROLLBACK;
  ELSE
    -- Update order
    UPDATE orders SET
      status = p_new_status,
      progress = p_progress,
      delivery_status = p_delivery_status,
      tracking_number = p_tracking_number,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;

    -- Create notification for status change
    INSERT INTO notifications (user_id, order_id, type, title, message)
    VALUES 
      (v_buyer_id, p_order_id, 'order_updated', 'Order Status Updated', 
       CONCAT('Your order status has been updated to: ', p_new_status)),
      (v_seller_id, p_order_id, 'order_updated', 'Order Status Updated', 
       CONCAT('Order status has been updated to: ', p_new_status));

    SET p_success = TRUE;
    SET p_message = 'Order status updated successfully';
    COMMIT;
  END IF;
END//

-- Procedure to release escrow funds
DROP PROCEDURE IF EXISTS ReleaseEscrow//
CREATE PROCEDURE ReleaseEscrow(
  IN p_order_id INT UNSIGNED,
  IN p_release_hash VARCHAR(100),
  OUT p_success BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_amount_cents INT;
  DECLARE v_currency CHAR(3);
  DECLARE v_seller_wallet VARCHAR(100);
  DECLARE v_buyer_wallet VARCHAR(100);
  DECLARE v_buyer_id INT UNSIGNED;
  DECLARE v_seller_id INT UNSIGNED;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    SET p_message = 'Database error occurred';
  END;

  START TRANSACTION;

  -- Get order details
  SELECT amount_cents, currency, seller_wallet, buyer_wallet, buyer_id, seller_id
  INTO v_amount_cents, v_currency, v_seller_wallet, v_buyer_wallet, v_buyer_id, v_seller_id
  FROM orders WHERE id = p_order_id AND status = 'delivered';

  IF v_amount_cents IS NULL THEN
    SET p_success = FALSE;
    SET p_message = 'Order not found or not ready for release';
    ROLLBACK;
  ELSE
    -- Update order status
    UPDATE orders SET
      status = 'completed',
      progress = 100,
      release_date = CURRENT_DATE,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;

    -- Create release transaction
    INSERT INTO transactions (
      order_id, transaction_type, amount_cents, currency,
      blockchain_hash, from_address, to_address, status
    ) VALUES (
      p_order_id, 'release', v_amount_cents, v_currency,
      p_release_hash, v_buyer_wallet, v_seller_wallet, 'confirmed'
    );

    -- Create notifications
    INSERT INTO notifications (user_id, order_id, type, title, message)
    VALUES 
      (v_seller_id, p_order_id, 'payment_released', 'Payment Released', 
       'Your payment has been released from escrow'),
      (v_buyer_id, p_order_id, 'payment_released', 'Payment Released', 
       'Payment has been released to the seller');

    SET p_success = TRUE;
    SET p_message = 'Escrow funds released successfully';
    COMMIT;
  END IF;
END//

-- Procedure to process refund
DROP PROCEDURE IF EXISTS ProcessRefund//
CREATE PROCEDURE ProcessRefund(
  IN p_order_id INT UNSIGNED,
  IN p_refund_reason TEXT,
  IN p_refund_hash VARCHAR(100),
  OUT p_success BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_amount_cents INT;
  DECLARE v_currency CHAR(3);
  DECLARE v_seller_wallet VARCHAR(100);
  DECLARE v_buyer_wallet VARCHAR(100);
  DECLARE v_buyer_id INT UNSIGNED;
  DECLARE v_seller_id INT UNSIGNED;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    SET p_message = 'Database error occurred';
  END;

  START TRANSACTION;

  -- Get order details
  SELECT amount_cents, currency, seller_wallet, buyer_wallet, buyer_id, seller_id
  INTO v_amount_cents, v_currency, v_seller_wallet, v_buyer_wallet, v_buyer_id, v_seller_id
  FROM orders WHERE id = p_order_id AND status IN ('locked', 'shipped');

  IF v_amount_cents IS NULL THEN
    SET p_success = FALSE;
    SET p_message = 'Order not found or not eligible for refund';
    ROLLBACK;
  ELSE
    -- Update order status
    UPDATE orders SET
      status = 'refunded',
      progress = 0,
      refund_reason = p_refund_reason,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;

    -- Create refund transaction
    INSERT INTO transactions (
      order_id, transaction_type, amount_cents, currency,
      blockchain_hash, from_address, to_address, status
    ) VALUES (
      p_order_id, 'refund', v_amount_cents, v_currency,
      p_refund_hash, v_seller_wallet, v_buyer_wallet, 'confirmed'
    );

    -- Create notifications
    INSERT INTO notifications (user_id, order_id, type, title, message)
    VALUES 
      (v_buyer_id, p_order_id, 'refund_processed', 'Refund Processed', 
       'Your refund has been processed and funds returned'),
      (v_seller_id, p_order_id, 'refund_processed', 'Refund Processed', 
       'A refund has been processed for this order');

    SET p_success = TRUE;
    SET p_message = 'Refund processed successfully';
    COMMIT;
  END IF;
END//

DELIMITER ;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to calculate user rating
DELIMITER //
DROP FUNCTION IF EXISTS GetUserRating//
CREATE FUNCTION GetUserRating(p_user_id INT UNSIGNED) 
RETURNS DECIMAL(3,2)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_rating DECIMAL(3,2) DEFAULT 0.00;
  
  SELECT COALESCE(AVG(rating), 0.00) INTO v_rating
  FROM reviews 
  WHERE reviewee_id = p_user_id AND is_public = TRUE;
  
  RETURN v_rating;
END//

-- Function to check if user can review order
DROP FUNCTION IF EXISTS CanUserReviewOrder//
CREATE FUNCTION CanUserReviewOrder(p_order_id INT UNSIGNED, p_user_id INT UNSIGNED) 
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_can_review BOOLEAN DEFAULT FALSE;
  DECLARE v_order_status VARCHAR(20);
  DECLARE v_buyer_id INT UNSIGNED;
  DECLARE v_seller_id INT UNSIGNED;
  DECLARE v_existing_review INT DEFAULT 0;
  
  -- Get order details
  SELECT status, buyer_id, seller_id INTO v_order_status, v_buyer_id, v_seller_id
  FROM orders WHERE id = p_order_id;
  
  -- Check if order is completed and user is involved
  IF v_order_status = 'completed' AND (v_buyer_id = p_user_id OR v_seller_id = p_user_id) THEN
    -- Check if user already reviewed this order
    SELECT COUNT(*) INTO v_existing_review
    FROM reviews 
    WHERE order_id = p_order_id AND reviewer_id = p_user_id;
    
    SET v_can_review = (v_existing_review = 0);
  END IF;
  
  RETURN v_can_review;
END//

-- Function to calculate escrow fee
DROP FUNCTION IF EXISTS CalculateEscrowFee//
CREATE FUNCTION CalculateEscrowFee(p_amount_cents INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE v_fee_cents INT DEFAULT 0;
  DECLARE v_fee_percentage DECIMAL(5,2) DEFAULT 2.5; -- 2.5% default fee
  
  -- Get fee percentage from settings
  SELECT CAST(setting_value AS DECIMAL(5,2)) INTO v_fee_percentage
  FROM system_settings 
  WHERE setting_key = 'escrow_fee_percentage' 
  LIMIT 1;
  
  -- Calculate fee (minimum 50 cents)
  SET v_fee_cents = GREATEST(ROUND(p_amount_cents * v_fee_percentage / 100), 50);
  
  RETURN v_fee_cents;
END//

DELIMITER ;

-- =============================================
-- TRIGGERS
-- =============================================

-- NOTE: MySQL does not support SELECT triggers. The previous attempt to increment
-- product view counts using an AFTER SELECT trigger is invalid and would fail.
-- We'll provide a small stored procedure that the application can call when a
-- product is viewed. This avoids unsupported triggers and prevents recursion.

DELIMITER //
`
-- Stored procedure to increment product view count safely from application code
DROP PROCEDURE IF EXISTS IncrementProductView//
CREATE PROCEDURE IncrementProductView(
  IN p_product_id INT UNSIGNED
)
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = p_product_id;
END//


CREATE TRIGGER tr_user_login_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  -- If last_login changed, update the updated_at timestamp on the row being saved.
  IF (NEW.last_login IS NOT NULL AND OLD.last_login IS NULL) OR (NEW.last_login IS NOT NULL AND NEW.last_login != OLD.last_login) THEN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
  END IF;
END//

-- Trigger to create order notifications
DROP TRIGGER IF EXISTS tr_order_notification//
CREATE TRIGGER tr_order_notification
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
  -- Create notification for buyer
  INSERT INTO notifications (user_id, order_id, type, title, message)
  VALUES (NEW.buyer_id, NEW.id, 'order_created', 'Order Created', 
          CONCAT('Your order #', NEW.id, ' has been created'));
  
  -- Create notification for seller
  INSERT INTO notifications (user_id, order_id, type, title, message)
  VALUES (NEW.seller_id, NEW.id, 'order_created', 'New Order', 
          CONCAT('You have received a new order #', NEW.id));
END//

-- Trigger to update order timestamps
DROP TRIGGER IF EXISTS tr_order_update_timestamp//
CREATE TRIGGER tr_order_update_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Fashion and apparel'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports & Outdoors', 'Sports equipment and outdoor gear'),
('Books & Media', 'Books, movies, music and other media'),
('Automotive', 'Car parts and automotive accessories'),
('Health & Beauty', 'Health and beauty products'),
('Toys & Games', 'Toys and gaming equipment'),
('Other', 'Miscellaneous items');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('escrow_fee_percentage', '2.5', 'Percentage fee for escrow services', TRUE),
('max_order_amount', '1000000', 'Maximum order amount in cents ($10,000)', TRUE),
('min_order_amount', '100', 'Minimum order amount in cents ($1)', TRUE),
('auto_release_days', '7', 'Days after delivery to auto-release funds', FALSE),
('support_email', 'support@escrow-app.com', 'Customer support email', TRUE),
('site_name', 'Escrow App', 'Application name', TRUE);

-- =============================================
-- VIEWS
-- =============================================

-- View for order details with user information
CREATE OR REPLACE VIEW order_details AS
SELECT 
  o.id,
  o.product_id,
  p.name as product_name,
  o.buyer_id,
  CONCAT(bu.first_name, ' ', bu.last_name) as buyer_name,
  bu.email as buyer_email,
  o.seller_id,
  CONCAT(su.first_name, ' ', su.last_name) as seller_name,
  su.email as seller_email,
  o.amount_cents,
  o.currency,
  o.status,
  o.progress,
  o.delivery_status,
  o.tracking_number,
  o.escrow_hash,
  o.created_at,
  o.updated_at
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN users bu ON o.buyer_id = bu.id
JOIN users su ON o.seller_id = su.id;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  u.wallet_address,
  COUNT(DISTINCT CASE WHEN o.buyer_id = u.id THEN o.id END) as orders_as_buyer,
  COUNT(DISTINCT CASE WHEN o.seller_id = u.id THEN o.id END) as orders_as_seller,
  COUNT(DISTINCT CASE WHEN o.buyer_id = u.id AND o.status = 'completed' THEN o.id END) as completed_orders_bought,
  COUNT(DISTINCT CASE WHEN o.seller_id = u.id AND o.status = 'completed' THEN o.id END) as completed_orders_sold,
  GetUserRating(u.id) as rating,
  u.created_at
FROM users u
LEFT JOIN orders o ON (u.id = o.buyer_id OR u.id = o.seller_id)
GROUP BY u.id;
