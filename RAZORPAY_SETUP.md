# Razorpay Integration Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables
Create a `.env` file in the backend directory with your Razorpay credentials:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET_KEY_HERE
```

### 2. Get Razorpay Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate a new key pair
4. Copy the Key ID and Key Secret

### 3. Test Configuration
Run the test script to verify your setup:

```bash
cd Organic-Hub--Backend
npm run test:razorpay
```

## 🔧 Features Implemented

### Backend
- ✅ Razorpay configuration with environment validation
- ✅ Payment order creation
- ✅ Payment verification with signature validation
- ✅ Webhook handling for payment events
- ✅ Payment status updates
- ✅ Refund processing
- ✅ Error handling and logging

### Frontend
- ✅ Dynamic payment method selection
- ✅ Razorpay checkout integration
- ✅ Payment status handling
- ✅ Fallback to COD when online payment unavailable
- ✅ Loading states and error handling

## 📡 API Endpoints

### Public Endpoints
- `GET /api/v1/payments/config` - Get Razorpay configuration
- `GET /api/v1/payments/methods` - Get available payment methods
- `POST /api/v1/payments/webhook` - Razorpay webhook handler

### Protected Endpoints
- `POST /api/v1/payments/create-order` - Create payment order
- `POST /api/v1/payments/verify` - Verify payment signature
- `GET /api/v1/payments/:paymentId` - Get payment details
- `POST /api/v1/payments/:paymentId/refund` - Process refund (Admin only)

## 🧪 Testing

### 1. Test Configuration
```bash
npm run test:razorpay
```

### 2. Test Payment Flow
1. Start backend server: `npm run dev`
2. Start frontend: `cd ../Organic-Hub---frontend && npm run dev`
3. Add items to cart and proceed to checkout
4. Select "Online Payment" and complete test payment

### 3. Test Webhooks
Use tools like ngrok to test webhooks locally:
```bash
ngrok http 5000
# Update webhook URL in Razorpay dashboard
```

## 🔒 Security Features

- ✅ Payment signature verification
- ✅ Webhook signature validation
- ✅ Environment variable validation
- ✅ Error handling without exposing sensitive data
- ✅ Rate limiting on payment endpoints

## 🚨 Troubleshooting

### Common Issues

1. **"Payment service not configured"**
   - Check if `.env` file exists
   - Verify Razorpay credentials are correct
   - Restart backend server after updating `.env`

2. **"Invalid signature" error**
   - Ensure webhook secret matches Razorpay dashboard
   - Check if webhook URL is correct
   - Verify webhook events are properly configured

3. **Frontend payment not loading**
   - Check browser console for errors
   - Verify Razorpay script is loading
   - Check if backend `/payments/config` endpoint is accessible

### Debug Mode
Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

## 📱 Frontend Integration

The frontend automatically:
- Loads Razorpay configuration from backend
- Shows/hides payment methods based on availability
- Handles payment success/failure
- Falls back to COD when online payment unavailable
- Provides loading states and error messages

## 🔄 Webhook Events Handled

- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `refund.processed` - Refund completed

## 📊 Monitoring

Check payment logs in:
- Backend console output
- `logs/` directory
- Razorpay dashboard analytics

## 🆘 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify Razorpay dashboard configuration
3. Test with Razorpay test credentials first
4. Ensure all environment variables are set correctly

## 🎯 Next Steps

After successful integration:
1. Test with real Razorpay credentials
2. Configure webhook URLs in production
3. Set up proper error monitoring
4. Implement payment analytics
5. Add payment method preferences to user profiles
