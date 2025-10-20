@echo off
REM Apply enhanced schema and run tests for escrow_app
echo Running DB setup...

mysql -u root -pAkvs2910* -e "CREATE DATABASE IF NOT EXISTS escrow_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
  echo Failed to create database
  pause
  exit /b 1
)

mysql -u root -pAkvs2910* escrow_app < "d:\Cursor projects\Escrow-\scripts\mysql\002_enhanced_schema.sql"
if %errorlevel% neq 0 (
  echo Failed to apply enhanced schema
  pause
  exit /b 1
)

mysql -u root -pAkvs2910* escrow_app < "d:\Cursor projects\Escrow-\scripts\mysql\003_test_connection.sql"
if %errorlevel% neq 0 (
  echo Test script failed
  pause
  exit /b 1
)

echo Done. Press any key to continue...
pause
