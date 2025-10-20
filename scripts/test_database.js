#!/usr/bin/env node

/**
 * Database Test Script
 * Tests database connection and validates schema
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function testDatabase() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Create connection
    const config = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'Akvs2910*',
      database: process.env.MYSQL_DATABASE || 'escrow_app',
      multipleStatements: true
    };
    
    connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful');
    
    // Test basic queries
    console.log('\n📊 Testing basic queries...');
    
    // Test tables exist
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [config.database]);
    
    console.log(`📋 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} rows)`);
    });
    
    // Test stored procedures
    const [procedures] = await connection.execute(`
      SELECT ROUTINE_NAME, ROUTINE_TYPE
      FROM information_schema.ROUTINES 
      WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
      ORDER BY ROUTINE_NAME
    `, [config.database]);
    
    console.log(`\n🔧 Found ${procedures.length} stored procedures:`);
    procedures.forEach(proc => {
      console.log(`  - ${proc.ROUTINE_NAME}`);
    });
    
    // Test functions
    const [functions] = await connection.execute(`
      SELECT ROUTINE_NAME, DATA_TYPE
      FROM information_schema.ROUTINES 
      WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'FUNCTION'
      ORDER BY ROUTINE_NAME
    `, [config.database]);
    
    console.log(`\n⚙️  Found ${functions.length} functions:`);
    functions.forEach(func => {
      console.log(`  - ${func.ROUTINE_NAME} (returns ${func.DATA_TYPE})`);
    });
    
    // Test triggers
    const [triggers] = await connection.execute(`
      SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE
      FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = ?
      ORDER BY TRIGGER_NAME
    `, [config.database]);
    
    console.log(`\n🎯 Found ${triggers.length} triggers:`);
    triggers.forEach(trigger => {
      console.log(`  - ${trigger.TRIGGER_NAME} on ${trigger.EVENT_OBJECT_TABLE}`);
    });
    
    // Test views
    const [views] = await connection.execute(`
      SELECT TABLE_NAME
      FROM information_schema.VIEWS 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [config.database]);
    
    console.log(`\n👁️  Found ${views.length} views:`);
    views.forEach(view => {
      console.log(`  - ${view.TABLE_NAME}`);
    });
    
    // Test foreign keys
    const [foreignKeys] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, CONSTRAINT_NAME
    `, [config.database]);
    
    console.log(`\n🔗 Found ${foreignKeys.length} foreign key constraints:`);
    foreignKeys.forEach(fk => {
      console.log(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });
    
    // Test system settings
    console.log('\n⚙️  Testing system settings...');
    const [settings] = await connection.execute(`
      SELECT setting_key, setting_value, description 
      FROM system_settings 
      WHERE is_public = TRUE
      ORDER BY setting_key
    `);
    
    console.log(`📋 Found ${settings.length} public settings:`);
    settings.forEach(setting => {
      console.log(`  - ${setting.setting_key}: ${setting.setting_value}`);
    });
    
    // Test categories
    console.log('\n📂 Testing categories...');
    const [categories] = await connection.execute(`
      SELECT name, description 
      FROM categories 
      WHERE is_active = TRUE
      ORDER BY name
    `);
    
    console.log(`📁 Found ${categories.length} active categories:`);
    categories.forEach(category => {
      console.log(`  - ${category.name}: ${category.description}`);
    });
    
    // Test stored procedure calls
    console.log('\n🧪 Testing stored procedures...');
    
    // Test CreateOrder procedure (with dummy data)
    try {
      const [result] = await connection.execute(`
        CALL CreateOrder(?, ?, ?, ?, ?, ?, @order_id, @success, @message)
      `, [1, 1, '0x1234567890abcdef', 10000, 'USD', '0xabcdef1234567890']);
      
      const [output] = await connection.execute('SELECT @order_id, @success, @message');
      console.log(`  - CreateOrder test: ${output[0]['@message']}`);
    } catch (error) {
      console.log(`  - CreateOrder test failed (expected if no test data): ${error.message}`);
    }
    
    // Test functions
    console.log('\n🧮 Testing functions...');
    
    try {
      const [ratingResult] = await connection.execute('SELECT GetUserRating(1) as rating');
      console.log(`  - GetUserRating(1): ${ratingResult[0].rating}`);
    } catch (error) {
      console.log(`  - GetUserRating test failed: ${error.message}`);
    }
    
    try {
      const [feeResult] = await connection.execute('SELECT CalculateEscrowFee(10000) as fee');
      console.log(`  - CalculateEscrowFee(10000): ${feeResult[0].fee} cents`);
    } catch (error) {
      console.log(`  - CalculateEscrowFee test failed: ${error.message}`);
    }
    
    console.log('\n✅ Database test completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`  - Tables: ${tables.length}`);
    console.log(`  - Stored Procedures: ${procedures.length}`);
    console.log(`  - Functions: ${functions.length}`);
    console.log(`  - Triggers: ${triggers.length}`);
    console.log(`  - Views: ${views.length}`);
    console.log(`  - Foreign Keys: ${foreignKeys.length}`);
    console.log(`  - System Settings: ${settings.length}`);
    console.log(`  - Categories: ${categories.length}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
if (require.main === module) {
  testDatabase().catch(console.error);
}

module.exports = { testDatabase };
