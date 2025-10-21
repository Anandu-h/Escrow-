#!/usr/bin/env node

/**
 * API Test Script
 * Tests all API endpoints to ensure they work with the new database schema
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test data
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
  };

  const testProduct = {
    productName: 'Test Product',
    description: 'A test product for API testing',
    price: '99.99',
    currency: 'USD',
    category: 'Electronics',
    estimatedDelivery: '7',
    condition: 'new',
    brand: 'TestBrand',
    model: 'TestModel',
    warranty: '1 year',
    shippingMethod: 'Standard',
    returnPolicy: '30 days',
    sellerWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
    sellerName: 'Test Seller'
  };

  // Helper function to run test
  async function runTest(name, testFn) {
    try {
      console.log(`🔍 Testing: ${name}`);
      await testFn();
      console.log(`✅ ${name} - PASSED\n`);
      results.passed++;
      results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ ${name} - FAILED: ${error.message}\n`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  // Test 1: User Registration
  await runTest('User Registration', async () => {
    const response = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    const result = await response.json();
    if (!result.ok) {
      throw new Error('Registration response not ok');
    }
  });

  // Test 2: Create Product
  let productId;
  await runTest('Create Product', async () => {
    const formData = new FormData();
    Object.entries(testProduct).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Product creation failed: ${error}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Product creation not successful');
    }

    productId = result.productId;
    console.log(`   Created product with ID: ${productId}`);
  });

  // Test 3: Get Products
  await runTest('Get Products', async () => {
    const response = await fetch(`${BASE_URL}/api/products`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Get products failed: ${error}`);
    }

    const result = await response.json();
    if (!result.products || !Array.isArray(result.products)) {
      throw new Error('Products response not valid');
    }

    console.log(`   Found ${result.products.length} products`);
  });

  // Test 4: Get Products by Category
  await runTest('Get Products by Category', async () => {
    const response = await fetch(`${BASE_URL}/api/products?category=Electronics`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Get products by category failed: ${error}`);
    }

    const result = await response.json();
    if (!result.products || !Array.isArray(result.products)) {
      throw new Error('Products by category response not valid');
    }

    console.log(`   Found ${result.products.length} electronics products`);
  });

  // Test 5: Create Order
  let orderId;
  await runTest('Create Order', async () => {
    const orderData = {
      productId: productId,
      buyerWallet: testUser.walletAddress,
      buyerName: 'Test Buyer',
      escrowHash: '0xtestescrowhash123456789'
    };

    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Order creation failed: ${error}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error('Order creation not successful');
    }

    orderId = result.orderId;
    console.log(`   Created order with ID: ${orderId}`);
  });

  // Test 6: Get Orders as Buyer
  await runTest('Get Orders as Buyer', async () => {
    const response = await fetch(`${BASE_URL}/api/orders?role=buyer&wallet=${testUser.walletAddress}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Get buyer orders failed: ${error}`);
    }

    const result = await response.json();
    if (!result.orders || !Array.isArray(result.orders)) {
      throw new Error('Buyer orders response not valid');
    }

    console.log(`   Found ${result.orders.length} buyer orders`);
  });

  // Test 7: Get Orders as Seller
  await runTest('Get Orders as Seller', async () => {
    const response = await fetch(`${BASE_URL}/api/orders?role=seller&wallet=${testProduct.sellerWallet}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Get seller orders failed: ${error}`);
    }

    const result = await response.json();
    if (!result.orders || !Array.isArray(result.orders)) {
      throw new Error('Seller orders response not valid');
    }

    console.log(`   Found ${result.orders.length} seller orders`);
  });

  // Test 8: Get Escrow Details
  await runTest('Get Escrow Details', async () => {
    const response = await fetch(`${BASE_URL}/api/escrow?orderId=${orderId}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Get escrow details failed: ${error}`);
    }

    const result = await response.json();
    if (!result.escrow) {
      throw new Error('Escrow response not valid');
    }

    console.log(`   Retrieved escrow details for order ${orderId}`);
  });

  // Test 9: Test Invalid Requests
  await runTest('Test Invalid Requests', async () => {
    // Test invalid registration
    const invalidRegResponse = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email', password: '123' })
    });

    if (invalidRegResponse.ok) {
      throw new Error('Invalid registration should have failed');
    }

    // Test invalid order request
    const invalidOrderResponse = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 99999, buyerWallet: 'invalid' })
    });

    if (invalidOrderResponse.ok) {
      throw new Error('Invalid order should have failed');
    }

    console.log('   Invalid requests properly rejected');
  });

  // Test 10: Test Pagination
  await runTest('Test Pagination', async () => {
    const response = await fetch(`${BASE_URL}/api/products?limit=5&offset=0`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pagination test failed: ${error}`);
    }

    const result = await response.json();
    if (!result.pagination) {
      throw new Error('Pagination response not valid');
    }

    console.log(`   Pagination working: ${result.pagination.total} total, ${result.products.length} returned`);
  });

  // Print results
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }

  console.log('\n🎉 API testing completed!');
  
  if (results.failed === 0) {
    console.log('🎊 All tests passed! Your API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };
