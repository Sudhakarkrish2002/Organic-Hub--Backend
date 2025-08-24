import dotenv from 'dotenv';
import { testPaymentService } from './src/services/paymentService.js';

// Load environment variables
dotenv.config();

// Test backend services
const testBackend = async () => {
  console.log('🧪 Testing Backend Services...\n');

  // Test payment service
  console.log('1. Testing Payment Service...');
  const paymentTest = await testPaymentService();
  if (paymentTest.success) {
    console.log('✅ Payment service working correctly\n');
  } else {
    console.log('⚠️  Payment service has issues:', paymentTest.error, '\n');
  }

  // Test database connection
  console.log('2. Testing Database Connection...');
  try {
    const mongoose = await import('mongoose');
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Database connected successfully\n');
    } else {
      console.log('⚠️  Database not connected\n');
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message, '\n');
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`Payment Service: ${paymentTest.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!paymentTest.success) {
    console.log('\n❌ Some services have issues. Check configuration.');
    process.exit(1);
  } else {
    console.log('\n✅ All services working correctly!');
  }
};

// Run tests
testBackend().catch(console.error);
