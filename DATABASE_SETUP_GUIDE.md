# Database Setup Guide for Escrow Application

This guide will help you set up the MySQL database for the Escrow application with all necessary tables, relationships, functions, triggers, and procedures.

## Prerequisites

- MySQL 8.0 or higher
- Node.js 18+ 
- npm or pnpm package manager

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=escrow_app

# Alternative: Use DATABASE_URL (overrides individual settings)
# DATABASE_URL=mysql://username:password@localhost:3306/escrow_app

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Database Setup Steps

### 1. Create Database

```sql
CREATE DATABASE IF NOT EXISTS escrow_app;
USE escrow_app;
```

### 2. Run Database Scripts

Execute the following scripts in order:

```bash
# 1. Initial schema (basic tables)
mysql -u root -p escrow_app < scripts/mysql/001_init.sql

# 2. Enhanced schema (all tables, procedures, functions, triggers)
mysql -u root -p escrow_app < scripts/mysql/002_enhanced_schema.sql

# 3. Test connection and validate schema
mysql -u root -p escrow_app < scripts/mysql/003_test_connection.sql
```

### 3. Test Database Connection

Run the Node.js test script:

```bash
# Install dependencies if not already done
npm install

# Run database test
node scripts/test_database.js
```

## Database Schema Overview

### Core Tables

1. **users** - User accounts and wallet addresses
2. **products** - Product listings with detailed information
3. **orders** - Order transactions and escrow management
4. **transactions** - Payment and blockchain transaction records
5. **notifications** - User notifications and alerts
6. **reviews** - Product and user reviews/ratings
7. **disputes** - Dispute management
8. **categories** - Product categories
9. **system_settings** - Application configuration

### Key Features

- **Foreign Key Relationships**: Proper referential integrity
- **Stored Procedures**: Complex business logic (CreateOrder, UpdateOrderStatus, ReleaseEscrow, ProcessRefund)
- **Functions**: Utility functions (GetUserRating, CalculateEscrowFee, CanUserReviewOrder)
- **Triggers**: Automatic data validation and status updates
- **Views**: Optimized queries for common operations
- **Indexes**: Performance optimization for frequently queried columns

## API Endpoints

### Products API (`/api/products`)

- **GET**: Fetch products with filtering and pagination
- **POST**: Create new product listings

### Orders API (`/api/orders`)

- **GET**: Fetch orders by buyer/seller wallet
- **POST**: Create new orders using stored procedures

### Escrow API (`/api/escrow`)

- **GET**: Get escrow details for specific orders

### Register API (`/api/register`)

- **POST**: User registration with email validation

## Stored Procedures

### CreateOrder
Creates a new order with automatic transaction and notification creation.

```sql
CALL CreateOrder(product_id, buyer_id, buyer_wallet, amount_cents, currency, escrow_hash, @order_id, @success, @message);
```

### UpdateOrderStatus
Updates order status with automatic notifications.

```sql
CALL UpdateOrderStatus(order_id, new_status, progress, delivery_status, tracking_number, @success, @message);
```

### ReleaseEscrow
Releases escrow funds to seller.

```sql
CALL ReleaseEscrow(order_id, release_hash, @success, @message);
```

### ProcessRefund
Processes refunds with automatic transaction creation.

```sql
CALL ProcessRefund(order_id, refund_reason, refund_hash, @success, @message);
```

## Database Functions

### GetUserRating(user_id)
Returns the average rating for a user based on reviews.

### CalculateEscrowFee(amount_cents)
Calculates escrow fee based on system settings.

### CanUserReviewOrder(order_id, user_id)
Checks if a user can review a specific order.

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check MySQL service is running
   - Verify connection parameters in `.env.local`
   - Ensure MySQL user has proper permissions

2. **Schema Errors**
   - Run scripts in correct order
   - Check MySQL version compatibility
   - Verify database exists and is accessible

3. **Stored Procedure Errors**
   - Ensure MySQL user has CREATE ROUTINE privileges
   - Check for syntax errors in procedure definitions

### Testing Database Connection

```bash
# Test basic connection
mysql -u root -p -e "SELECT 'Connection successful' as status;"

# Test database access
mysql -u root -p -e "USE escrow_app; SHOW TABLES;"

# Test stored procedures
mysql -u root -p -e "USE escrow_app; SHOW PROCEDURE STATUS WHERE Db = 'escrow_app';"
```

## Performance Optimization

### Indexes
The schema includes optimized indexes for:
- User lookups by wallet address
- Order filtering by status and dates
- Product searches by category and seller
- Notification queries by user and type

### Query Optimization
- Use the provided views for complex joins
- Leverage stored procedures for business logic
- Utilize database functions for calculations

## Security Considerations

1. **Database User Permissions**
   - Create dedicated application user with limited privileges
   - Avoid using root user in production
   - Enable SSL connections for production

2. **Data Validation**
   - All stored procedures include input validation
   - Triggers enforce data integrity
   - Foreign key constraints prevent orphaned records

3. **Sensitive Data**
   - Password hashes are properly encrypted
   - Wallet addresses are validated
   - Transaction data is immutable

## Monitoring and Maintenance

### Regular Tasks
- Monitor database performance
- Check for failed transactions
- Review notification queues
- Update system settings as needed

### Backup Strategy
```bash
# Create database backup
mysqldump -u root -p escrow_app > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
mysql -u root -p escrow_app < backup_file.sql
```

## Support

If you encounter issues:

1. Check the database logs: `/var/log/mysql/error.log`
2. Verify all environment variables are set correctly
3. Run the test script to identify specific issues
4. Check MySQL user permissions and database access

For additional help, refer to the MySQL documentation or contact your database administrator.
