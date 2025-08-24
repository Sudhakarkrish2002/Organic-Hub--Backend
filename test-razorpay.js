import dotenv from 'dotenv';
import { getRazorpayInstance, isRazorpayConfigured, validateRazorpayConfig } from './src/config/razorpay.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Razorpay Configuration...\n');

// Test 1: Check environment variables
console.log('1. Environment Variables Check:');
console.log(`   RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing'}\n`);

// Test 2: Validate configuration
console.log('2. Configuration Validation:');
const isValid = validateRazorpayConfig();
console.log(`   Configuration Valid: ${isValid ? '✅ Yes' : '❌ No'}\n`);

// Test 3: Check if Razorpay is configured
console.log('3. Razorpay Availability:');
const isAvailable = isRazorpayConfigured();
console.log(`   Razorpay Available: ${isAvailable ? '✅ Yes' : '❌ No'}\n`);

// Test 4: Try to get Razorpay instance
console.log('4. Razorpay Instance:');
try {
  const instance = getRazorpayInstance();
  if (instance) {
    console.log('   ✅ Razorpay instance created successfully');
    console.log(`   Key ID: ${process.env.RAZORPAY_KEY_ID}`);
  } else {
    console.log('   ❌ Failed to create Razorpay instance');
  }
} catch (error) {
  console.log(`   ❌ Error creating Razorpay instance: ${error.message}`);
}

console.log('\n📝 Next Steps:');
if (!isValid) {
  console.log('   1. Create a .env file in the backend directory');
  console.log('   2. Add your Razorpay credentials:');
  console.log('      RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID');
  console.log('      RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY');
  console.log('   3. Restart the backend server');
} else {
  console.log('   ✅ Razorpay is properly configured!');
  console.log('   🚀 You can now test payment endpoints');
}

console.log('\n🔗 Test Payment Endpoints:');
console.log('   GET  /api/v1/payments/config - Get Razorpay config');
console.log('   GET  /api/v1/payments/methods - Get payment methods');
console.log('   POST /api/v1/payments/create-order - Create payment order');
console.log('   POST /api/v1/payments/verify - Verify payment');
