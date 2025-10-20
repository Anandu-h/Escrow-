-- Database Connection and Schema Test Script
-- This script tests the database connection and validates the schema

USE escrow_app;

-- Test basic connection
SELECT 'Database connection successful' as status;

-- Test all tables exist
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'escrow_app'
ORDER BY TABLE_NAME;

-- Test stored procedures exist
SELECT 
  ROUTINE_NAME,
  ROUTINE_TYPE,
  CREATED
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'escrow_app'
ORDER BY ROUTINE_NAME;

-- Test functions exist
SELECT 
  ROUTINE_NAME,
  ROUTINE_TYPE,
  DATA_TYPE
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'escrow_app' 
  AND ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;

-- Test triggers exist
SELECT 
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  EVENT_OBJECT_TABLE
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'escrow_app'
ORDER BY TRIGGER_NAME;

-- Test views exist
SELECT 
  TABLE_NAME,
  VIEW_DEFINITION
FROM information_schema.VIEWS 
WHERE TABLE_SCHEMA = 'escrow_app'
ORDER BY TABLE_NAME;

-- Test foreign key constraints
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'escrow_app' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Test indexes
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME,
  NON_UNIQUE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'escrow_app'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
