# Quick Setup Guide

## 🚀 Database Setup Steps

### Option 1: Automated Setup (Windows)
```bash
# Run the automated setup script
scripts\setup_database.bat
```

### Option 2: Automated Setup (Linux/Mac)
```bash
# Make the script executable
chmod +x scripts/setup_database.sh

# Run the automated setup script
./scripts/setup_database.sh
```

### Option 3: Manual Setup
```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS escrow_app;"

# 2. Apply enhanced schema
mysql -u root -p escrow_app < scripts/mysql/002_enhanced_schema.sql

# 3. Test database
mysql -u root -p escrow_app < scripts/mysql/003_test_connection.sql
```

## 🧪 Testing Steps

### 1. Test Database Connection
```bash
npm run db:test
```

### 2. Test API Endpoints
```bash
npm run api:test
```

### 3. Test Everything
```bash
npm run test:all
```

## 🚀 Start Development

```bash
# Start the development server
npm run dev
```

## 📋 What You'll Get

After running the setup, your database will have:

- ✅ **9 Core Tables**: users, products, orders, transactions, notifications, reviews, disputes, categories, system_settings
- ✅ **4 Stored Procedures**: CreateOrder, UpdateOrderStatus, ReleaseEscrow, ProcessRefund
- ✅ **3 Database Functions**: GetUserRating, CalculateEscrowFee, CanUserReviewOrder
- ✅ **4 Triggers**: Automatic data management and notifications
- ✅ **2 Views**: Optimized queries for complex operations
- ✅ **25+ Indexes**: Performance optimization
- ✅ **15+ Foreign Keys**: Referential integrity

## 🔧 Available Scripts

- `npm run db:test` - Test database connection and schema
- `npm run api:test` - Test all API endpoints
- `npm run test:all` - Run both database and API tests
- `npm run dev` - Start development server

## 🆘 Troubleshooting

### If MySQL password is required:
1. Make sure MySQL is running
2. Use the correct root password
3. Check if MySQL service is started

### If database connection fails:
1. Check your MySQL credentials
2. Ensure MySQL service is running
3. Verify the database exists

### If API tests fail:
1. Make sure the database is set up first
2. Check that all tables exist
3. Verify stored procedures are created

## 📞 Need Help?

1. Check the `DATABASE_SETUP_GUIDE.md` for detailed instructions
2. Run the test scripts to identify issues
3. Verify your MySQL installation and credentials

Your escrow application will be fully functional after completing these steps! 🎉
