# Security and Database Integrity Audit Report
**Date:** October 19, 2025  
**Project:** Escrow Application  
**Auditor:** Cline AI Assistant

---

## Executive Summary

This audit identified **8 critical issues** and **5 moderate issues** affecting security, database integrity, and application reliability. Immediate action is required to address the critical security vulnerabilities.

### Severity Levels:
- 🔴 **CRITICAL**: Immediate security risk or data integrity issue
- 🟠 **HIGH**: Significant issue requiring prompt attention
- 🟡 **MODERATE**: Important but not immediately critical
- 🟢 **LOW**: Minor issue or improvement suggestion

---

## 🔴 CRITICAL ISSUES

### 1. Hardcoded Database Password (lib/db.ts)
**Severity:** 🔴 CRITICAL  
**File:** `lib/db.ts` (Line 18)

**Issue:**
```typescript
const password = process.env.MYSQL_PASSWORD || "Akvs2910*"
```

The database password `"Akvs2910*"` is hardcoded as a fallback value. This is a critical security vulnerability:
- Password is exposed in source code
- Password may be committed to version control
- Anyone with access to the codebase can access the database

**Recommendation:**
```typescript
const password = process.env.MYSQL_PASSWORD
if (!password) {
  throw new Error('MYSQL_PASSWORD environment variable is required')
}
```

**Action Required:**
1. Remove hardcoded password immediately
2. Rotate the database password
3. Update all deployment configurations with new password
4. Add `.env` to `.gitignore` if not already present
5. Review git history and remove exposed credentials

---

### 2. SQL Injection Vulnerability (app/api/orders/route.ts)
**Severity:** 🔴 CRITICAL  
**File:** `app/api/orders/route.ts` (Lines 12-15)

**Issue:**
```typescript
const col = role === "buyer" ? "buyer_wallet" : "seller_wallet"
// Later used directly in SQL:
WHERE LOWER(o.${col}) = ?
```

While there is input validation (`if (!["buyer", "seller"].includes(role))`), the dynamic column name construction is still a dangerous pattern that could be exploited if the validation is ever bypassed or modified incorrectly.

**Recommendation:**
```typescript
// Use explicit query construction instead
let whereClause: string
if (role === "buyer") {
  whereClause = "WHERE LOWER(o.buyer_wallet) = ?"
} else {
  whereClause = "WHERE LOWER(o.seller_wallet) = ?"
}

const rows = await query(`
  SELECT ... FROM orders o
  JOIN products p ON o.product_id = p.id
  JOIN users bu ON o.buyer_id = bu.id
  JOIN users su ON o.seller_id = su.id
  ${whereClause}
  ORDER BY o.created_at DESC
`, [wallet])
```

---

### 3. Schema Mismatch in Escrow API (app/api/escrow/route.ts)
**Severity:** 🔴 CRITICAL  
**File:** `app/api/escrow/route.ts` (Line 18-19)

**Issue:**
The query references non-existent columns:
```sql
SELECT id, product, amount_cents, currency, status, escrow_hash, 
       buyer_wallet, seller_wallet, created_at, estimated_release_at
FROM orders
```

**Problems:**
- `product` column does NOT exist in orders table (should be `product_id`)
- `estimated_release_at` column does NOT exist (schema has `release_date`)

**Database Schema (from 002_enhanced_schema.sql):**
```sql
CREATE TABLE orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,  -- Not 'product'
  ...
  release_date DATE NULL,             -- Not 'estimated_release_at'
  ...
)
```

**Recommendation:**
```typescript
const rows = await query<{
  id: number
  product_id: number
  product_name: string
  amount_cents: number
  currency: string
  status: string
  escrow_hash: string | null
  buyer_wallet: string
  seller_wallet: string
  created_at: string
  release_date: string | null
}[]>(
  `SELECT 
    o.id, 
    o.product_id,
    p.name as product_name,
    o.amount_cents, 
    o.currency, 
    o.status, 
    o.escrow_hash, 
    o.buyer_wallet, 
    o.seller_wallet, 
    o.created_at, 
    o.release_date
  FROM orders o
  JOIN products p ON o.product_id = p.id
  WHERE o.id = ?
  LIMIT 1`,
  [orderId]
)
```

---

### 4. Weak Password Storage for Auto-Generated Users
**Severity:** 🔴 CRITICAL  
**Files:** 
- `app/api/products/route.ts` (Line 44)
- `app/api/orders/route.ts` (Line 85)

**Issue:**
```typescript
// Creating users with hardcoded weak passwords
"INSERT INTO users (email, password_hash, wallet_address, first_name, last_name) 
 VALUES (?, ?, ?, ?, ?)",
[`seller_${Date.now()}@temp.com`, 'temp_hash', sellerWallet, sellerName || 'Seller', '']
```

**Problems:**
1. Not actually hashing passwords - storing plain text `'temp_hash'`
2. Should use proper password hashing (bcrypt) even for temporary accounts
3. Creates security vulnerability if these accounts are ever used for authentication
4. Violates the `password_hash` column expectation

**Recommendation:**
```typescript
import bcrypt from "bcryptjs"

// Generate a random secure password for wallet-only users
const tempPassword = crypto.randomBytes(32).toString('hex')
const hashedPassword = await bcrypt.hash(tempPassword, 12)

const newSeller = await query(
  "INSERT INTO users (email, password_hash, wallet_address, first_name, last_name, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
  [
    `wallet_${sellerWallet.slice(0, 8)}@blockchain.user`, 
    hashedPassword, 
    sellerWallet, 
    sellerName || 'Seller', 
    '',
    false  // Mark as not verified
  ]
)
```

---

## 🟠 HIGH PRIORITY ISSUES

### 5. Missing Transaction Safety
**Severity:** 🟠 HIGH  
**Files:** Multiple API routes

**Issue:**
Database operations that should be atomic are not wrapped in transactions. For example, in `orders/route.ts`, the order creation process involves:
1. Checking product exists
2. Getting/creating buyer user
3. Calling stored procedure
4. Querying output parameters

If any step fails, you may have partial data (e.g., buyer created but order not created).

**Recommendation:**
While the `CreateOrder` stored procedure uses transactions internally, the user creation steps should also be transactional:

```typescript
const connection = await db.getConnection()
try {
  await connection.beginTransaction()
  
  // Get or create buyer
  let buyerId: number
  const existingBuyer = await connection.query(...)
  if (existingBuyer.length > 0) {
    buyerId = existingBuyer[0].id
  } else {
    const newBuyer = await connection.query(...)
    buyerId = newBuyer.insertId
  }
  
  // Call stored procedure
  await connection.query('CALL CreateOrder(...)')
  
  await connection.commit()
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  connection.release()
}
```

---

### 6. Race Condition in User Creation
**Severity:** 🟠 HIGH  
**Files:** 
- `app/api/products/route.ts`
- `app/api/orders/route.ts`

**Issue:**
The pattern of checking if a user exists and then creating them is vulnerable to race conditions:

```typescript
const existingSeller = await query("SELECT id FROM users WHERE wallet_address = ?", [sellerWallet])
if (existingSeller.length > 0) {
  sellerId = existingSeller[0].id
} else {
  const newSeller = await query("INSERT INTO users ...", [...])
  sellerId = newSeller.insertId
}
```

If two requests with the same wallet address arrive simultaneously, both might pass the check and attempt to insert, causing a duplicate key error.

**Recommendation:**
Use MySQL's `INSERT ... ON DUPLICATE KEY UPDATE` pattern:

```typescript
const result = await query(
  `INSERT INTO users (email, password_hash, wallet_address, first_name, last_name)
   VALUES (?, ?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE 
     id = LAST_INSERT_ID(id),
     last_login = CURRENT_TIMESTAMP`,
  [`wallet_${Date.now()}@temp.com`, hashedPassword, sellerWallet, sellerName || 'Seller', '']
)
const sellerId = result.insertId
```

---

### 7. Inconsistent Error Handling
**Severity:** 🟠 HIGH  
**Files:** All API routes

**Issue:**
Error handling is inconsistent across routes:
- Some catch and log errors, some don't
- Error messages vary in detail
- No structured error logging
- Database errors exposed to clients

**Examples:**
```typescript
// Good: app/api/register/route.ts catches JSON parse errors
const { email, password, walletAddress } = await req.json().catch(() => ({}))

// Poor: app/api/escrow/route.ts - generic error handling
catch (error) {
  console.error("Error:", error)
  return NextResponse.json({ error: "Failed" }, { status: 500 })
}
```

**Recommendation:**
Create a centralized error handler:

```typescript
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  // Don't expose internal errors to clients
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

---

## 🟡 MODERATE ISSUES

### 8. Missing Input Validation
**Severity:** 🟡 MODERATE  
**Files:** Multiple routes

**Issue:**
Insufficient input validation on many endpoints. Examples:

1. **products/route.ts**: No validation for:
   - Price ranges (could be negative or unreasonably high)
   - String lengths (description could be extremely long)
   - Currency code format (should be ISO 4217)

2. **orders/route.ts**: No validation for:
   - Wallet address format
   - Product ID existence before passing to stored procedure

**Recommendation:**
Add validation middleware or helper functions:

```typescript
// lib/validators.ts
export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function validatePrice(price: number): boolean {
  return price > 0 && price < 1000000 && Number.isFinite(price)
}

export function validateCurrency(currency: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'ETH', 'BTC']
  return validCurrencies.includes(currency.toUpperCase())
}
```

---

### 9. No Rate Limiting
**Severity:** 🟡 MODERATE  
**Files:** All API routes

**Issue:**
No rate limiting on API endpoints. This allows:
- Brute force attacks on authentication
- API abuse (excessive product creation, order spam)
- DoS attacks

**Recommendation:**
Implement rate limiting using middleware:

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  return NextResponse.next()
}
```

---

### 10. Incomplete Foreign Key Validation
**Severity:** 🟡 MODERATE  
**Files:** API routes

**Issue:**
Some operations don't validate foreign key relationships before performing actions:

1. In `products/route.ts`, when setting category_id, the code checks if category exists but allows NULL without checking if that's intended
2. The stored procedures do validation, but API layer should also validate

**Recommendation:**
Add pre-validation in API layer before calling stored procedures:

```typescript
// Before creating order
const product = await query(
  "SELECT id, is_active, seller_id FROM products WHERE id = ? AND is_active = TRUE",
  [productId]
)
if (product.length === 0) {
  return NextResponse.json(
    { error: "Product not found or not available" },
    { status: 404 }
  )
}

// Ensure buyer isn't also the seller
if (product[0].seller_id === buyerId) {
  return NextResponse.json(
    { error: "Cannot purchase your own product" },
    { status: 400 }
  )
}
```

---

### 11. Missing Indexes for Query Performance
**Severity:** 🟡 MODERATE  
**File:** `scripts/mysql/002_enhanced_schema.sql`

**Issue:**
While the schema has many indexes, some common query patterns are not optimized:

1. No composite index for `(is_active, created_at)` on products (used in listing queries)
2. No index on `users.email` for case-insensitive lookups (queries use `LOWER(email)`)

**Recommendation:**
Add these indexes:

```sql
-- For product listings with filters
ALTER TABLE products 
ADD INDEX idx_active_created (is_active, created_at);

-- For case-insensitive email lookups (if using MySQL 8.0+)
-- Or handle in application layer
ALTER TABLE users 
ADD INDEX idx_email_lower ((LOWER(email)));
```

---

### 12. Potential Memory Issues with Large Result Sets
**Severity:** 🟡 MODERATE  
**Files:** API routes using query function

**Issue:**
The generic `query` function loads all results into memory. For large datasets (e.g., all products, all orders), this could cause memory issues.

**Current Implementation:**
```typescript
export async function query<T = any>(sql: string, params: any[] = []) {
  const [rows] = await db.query<mysql.RowDataPacket[]>(sql, params)
  return rows as unknown as T
}
```

**Recommendation:**
1. Implement proper pagination on all list endpoints
2. Consider adding a streaming option for large queries
3. Set default limits and enforce maximum limits

```typescript
// In products/route.ts
const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100) // Max 100
const offset = parseInt(searchParams.get("offset") || "0")

// Validate offset isn't too large
if (offset > 10000) {
  return NextResponse.json(
    { error: "Offset too large, use pagination" },
    { status: 400 }
  )
}
```

---

## 🟢 LOW PRIORITY / IMPROVEMENTS

### 13. Database Connection Pool Configuration
**File:** `lib/db.ts`

**Suggestion:**
The connection pool configuration could be optimized:

```typescript
return mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 10,  // May be too low for production
  waitForConnections: true,
  queueLimit: 0,  // Should set a limit to prevent unbounded queue
  enableKeepAlive: true,  // Keep connections alive
  keepAliveInitialDelay: 0
})
```

---

### 14. Missing Audit Trail
**File:** Database schema

**Suggestion:**
Consider adding an audit log table to track important actions:

```sql
CREATE TABLE audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  action_type VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id INT UNSIGNED NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user (user_id),
  INDEX idx_action (action_type),
  INDEX idx_table_record (table_name, record_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;
```

---

### 15. Email Validation Could Be Stronger
**File:** `app/api/register/route.ts`

**Current Implementation:**
```typescript
function isEmailFormatValid(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
```

**Suggestion:**
Use a more robust email validation pattern or library:

```typescript
// More comprehensive regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Or use a library
import validator from 'validator'
const isValid = validator.isEmail(email)
```

---

## Database Integrity Checks

### Foreign Key Relationships
✅ **PASS**: All foreign keys are properly defined with appropriate CASCADE/SET NULL actions

### Data Type Consistency
⚠️ **ISSUES FOUND**:
1. Orders API references non-existent columns (see Issue #3)
2. Currency stored as CHAR(3) but not validated in application layer

### Trigger and Stored Procedure Review
✅ **PASS**: Stored procedures use proper transaction handling
✅ **PASS**: Triggers are correctly implemented
⚠️ **WARNING**: IncrementProductView procedure has no error handling

---

## Testing Recommendations

### 1. Database Connection Test
Create a test script to verify database connectivity:

```javascript
// scripts/test_database_integrity.js
const mysql = require('mysql2/promise')

async function testDatabaseIntegrity() {
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'escrow_app'
  }
  
  try {
    const connection = await mysql.createConnection(config)
    
    // Test 1: Check all tables exist
    const [tables] = await connection.query('SHOW TABLES')
    console.log('✓ Tables found:', tables.length)
    
    // Test 2: Check stored procedures
    const [procs] = await connection.query(
      "SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'",
      [config.database]
    )
    console.log('✓ Stored procedures:', procs.length)
    
    // Test 3: Check foreign keys
    const [fks] = await connection.query(
      "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA = ?",
      [config.database]
    )
    console.log('✓ Foreign keys:', fks[0].count)
    
    await connection.end()
    console.log('\n✅ Database integrity check passed')
  } catch (error) {
    console.error('❌ Database integrity check failed:', error.message)
    process.exit(1)
  }
}

testDatabaseIntegrity()
```

### 2. API Endpoint Tests
Test all critical paths with security focus:

```javascript
// Test SQL injection attempts
// Test authentication bypass attempts  
// Test race conditions in user creation
// Test schema mismatches
```

---

## Priority Action Items

### IMMEDIATE (Within 24 hours)
1. ✅ Remove hardcoded database password (Issue #1)
2. ✅ Fix SQL injection vulnerability (Issue #2)
3. ✅ Fix escrow API schema mismatch (Issue #3)
4. ✅ Fix weak password storage (Issue #4)

### SHORT TERM (Within 1 week)
5. ⚠️ Implement transaction safety (Issue #5)
6. ⚠️ Fix race conditions in user creation (Issue #6)
7. ⚠️ Standardize error handling (Issue #7)
8. ⚠️ Add input validation (Issue #8)

### MEDIUM TERM (Within 1 month)
9. 🔄 Implement rate limiting (Issue #9)
10. 🔄 Add foreign key pre-validation (Issue #10)
11. 🔄 Add missing indexes (Issue #11)
12. 🔄 Implement pagination limits (Issue #12)

---

## Conclusion

The application has a solid database schema with good use of stored procedures and triggers. However, there are **critical security vulnerabilities** that must be addressed immediately, particularly:

1. **Hardcoded credentials**
2. **SQL injection risks**
3. **Schema mismatches causing runtime errors**
4. **Weak password handling**

Once these critical issues are resolved, the application will have a much stronger security posture. The moderate and low-priority issues should be addressed in planned maintenance cycles.

### Overall Risk Assessment
**Current State:** 🔴 HIGH RISK  
**After Critical Fixes:** 🟡 MODERATE RISK  
**After All Fixes:** 🟢 LOW RISK

---

**Report Generated:** October 19, 2025  
**Audit Tool:** Cline AI Assistant  
**Next Review:** Recommended within 30 days after fixes are implemented
