import Razorpay from 'razorpay';

// Validate environment variables
const validateRazorpayConfig = () => {
  const requiredVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing Razorpay environment variables: ${missingVars.join(', ')}`);
    console.warn('Payment functionality will be disabled until these are configured.');
    return false;
  }
  
  return true;
};

// Initialize Razorpay instance
let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance && validateRazorpayConfig()) {
    try {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      console.log('✅ Razorpay initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Razorpay:', error.message);
      return null;
    }
  }
  return razorpayInstance;
};

// Check if Razorpay is properly configured
const isRazorpayConfigured = () => {
  return validateRazorpayConfig() && getRazorpayInstance() !== null;
};

// Get Razorpay public key for frontend
const getRazorpayPublicKey = () => {
  return process.env.RAZORPAY_KEY_ID || null;
};

export {
  getRazorpayInstance,
  isRazorpayConfigured,
  getRazorpayPublicKey,
  validateRazorpayConfig
};
