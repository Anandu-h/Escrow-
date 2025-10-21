#!/bin/bash

echo "Setting up MySQL database for Escrow Application..."
echo

# Check if MySQL is accessible
if ! command -v mysql &> /dev/null; then
    echo "MySQL is not accessible. Please ensure MySQL is installed and in your PATH."
    exit 1
fi

echo "Please enter your MySQL root password when prompted:"
echo

# Create database if it doesn't exist
echo "Creating database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS escrow_app;"

# Apply the enhanced schema
echo "Applying enhanced database schema..."
mysql -u root -p escrow_app < scripts/mysql/002_enhanced_schema.sql

# Test the database
echo "Testing database setup..."
mysql -u root -p escrow_app < scripts/mysql/003_test_connection.sql

echo
echo "Database setup completed!"
echo
echo "Next steps:"
echo "1. Run: npm run db:test"
echo "2. Run: npm run api:test"
echo "3. Run: npm run dev"
echo
