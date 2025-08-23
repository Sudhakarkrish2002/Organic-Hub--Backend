// Simple test script for Razorpay integration
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

// Test 1: Check if server is running
async function testHealth() {
  try {
    const response = await fetch(`${BASE_URL}/../health`);
    const data = await response.json();
    console.log('✅ Server Health:', data.message);
  } catch (error) {
    console.log('❌ Server not running:', error.message);
  }
}

// Test 2: Check payment methods endpoint
async function testPaymentMethods() {
  try {
    const response = await fetch(`${BASE_URL}/payments/methods`);
    const data = await response.json();
    console.log('✅ Payment Methods:', data.data.paymentMethods);
  } catch (error) {
    console.log('❌ Payment methods error:', error.message);
  }
}

// Test 3: Create a test payment order (requires authentication)
async function testCreatePaymentOrder() {
  try {
    // First register a test user
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '9999999999'
      })
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      const token = registerData.data.token;
      console.log('✅ User registered successfully');

      // Now create a payment order
      const paymentResponse = await fetch(`${BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: 100, // ₹100
          currency: 'INR',
          receipt: 'test_receipt_123'
        })
      });

      const paymentData = await paymentResponse.json();
      
      if (paymentData.success) {
        console.log('✅ Payment order created:', paymentData.data);
      } else {
        console.log('❌ Payment order failed:', paymentData.message);
      }
    } else {
      const errorData = await registerResponse.json();
      console.log('❌ User registration failed:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🔄 Testing Razorpay Integration...\n');
  
  await testHealth();
  await testPaymentMethods();
  
  console.log('\n⚠️  Note: Payment order test will fail until you add real Razorpay credentials');
  console.log('   Update your .env file with actual RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET\n');
  
  await testCreatePaymentOrder();
}

runTests();
