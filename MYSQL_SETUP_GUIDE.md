# MySQL Setup Guide for Escrow Application

## 1. Install MySQL

### Option A: MySQL Community Server
1. Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Install and set root password
3. Start MySQL service

### Option B: XAMPP (Easier)
1. Download from [apachefriends.org](https://www.apachefriends.org/)
2. Install and start MySQL from XAMPP Control Panel

## 2. Create Database

Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE escrow_app;
USE escrow_app;
```

Then run the schema from `scripts/mysql/001_init.sql`:

```sql
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
```

## 3. Environment Variables

Create `.env.local` file in your project root:

```env
# Database Configuration
DATABASE_URL=mysql://root:your_password@localhost:3306/escrow_app

# OR use individual variables:
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=escrow_app
```

Replace `your_password` with your actual MySQL root password.

## 4. Test Your Setup

1. Start your Next.js app: `npm run dev`
2. Go to `/seller` and connect wallet
3. Click "Add New Product" to create a product
4. Go to `/buyer` and connect wallet
5. Click "Browse Products" to see and purchase products

## 5. View Database

### phpMyAdmin (if using XAMPP)
- Go to `http://localhost/phpmyadmin`
- Select `escrow_app` database
- View `users` and `orders` tables

### MySQL Command Line
```bash
mysql -u root -p
USE escrow_app;
SELECT * FROM users;
SELECT * FROM orders;
```

## Features Now Working

✅ **Seller Dashboard**: Create products with form
✅ **Buyer Dashboard**: Browse and purchase products  
✅ **MySQL Integration**: All data stored in database
✅ **Wallet Connection**: Required for both buyer/seller
✅ **Product Management**: Full CRUD operations
✅ **Order Tracking**: Real-time order status updates

## Troubleshooting

- **Connection Issues**: Check MySQL service is running
- **Permission Errors**: Ensure MySQL user has CREATE/INSERT/SELECT permissions
- **Port Issues**: Default MySQL port is 3306
- **Database Not Found**: Make sure `escrow_app` database exists

