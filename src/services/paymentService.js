import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
export const createPaymentOrder = async (orderData) => {
  try {
    const options = {
      amount: Math.round(orderData.totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderData.orderNumber,
      notes: {
        orderId: orderData._id.toString(),
        userId: orderData.user.toString()
      }
    };

    const paymentOrder = await razorpay.orders.create(options);
    
    return {
      success: true,
      data: {
        id: paymentOrder.id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        receipt: paymentOrder.receipt
      }
    };
  } catch (error) {
    console.error('Error creating payment order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify payment signature
export const verifyPaymentSignature = (paymentId, orderId, signature) => {
  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

// Process payment
export const processPayment = async (paymentData) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId
    } = paymentData;

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      return {
        success: false,
        error: 'Invalid payment signature'
      };
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status === 'captured') {
      // Update order with payment details
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          paymentDetails: {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            method: payment.method,
            amount: payment.amount / 100, // Convert from paise to rupees
            currency: payment.currency,
            status: payment.status,
            capturedAt: new Date()
          }
        },
        { new: true }
      );

      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          order,
          payment: {
            id: razorpay_payment_id,
            status: payment.status,
            amount: payment.amount / 100
          }
        }
      };
    } else {
      return {
        success: false,
        error: `Payment not captured. Status: ${payment.status}`
      };
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process refund
export const processRefund = async (paymentId, amount, reason = 'Customer request') => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
      notes: {
        reason: reason
      }
    });

    return {
      success: true,
      data: {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100, // Convert from paise to rupees
        status: refund.status,
        reason: reason
      }
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    
    return {
      success: true,
      data: {
        id: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        email: payment.email,
        contact: payment.contact,
        createdAt: payment.created_at,
        capturedAt: payment.captured_at
      }
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get refund details
export const getRefundDetails = async (refundId) => {
  try {
    const refund = await razorpay.payments.fetchRefund(refundId);
    
    return {
      success: true,
      data: {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        notes: refund.notes,
        createdAt: refund.created_at
      }
    };
  } catch (error) {
    console.error('Error fetching refund details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get payment methods
export const getPaymentMethods = async () => {
  try {
    const methods = await razorpay.payments.fetchPaymentMethods();
    
    return {
      success: true,
      data: methods
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create subscription for recurring payments
export const createSubscription = async (subscriptionData) => {
  try {
    const options = {
      plan_id: subscriptionData.planId,
      customer_notify: 1,
      total_count: subscriptionData.totalCount || 12, // Default 12 months
      notes: {
        userId: subscriptionData.userId,
        planName: subscriptionData.planName
      }
    };

    const subscription = await razorpay.subscriptions.create(options);
    
    return {
      success: true,
      data: {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        currentStart: subscription.current_start,
        currentEnd: subscription.current_end,
        totalCount: subscription.total_count,
        paidCount: subscription.paid_count
      }
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId);
    
    return {
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        cancelledAt: subscription.cancelled_at
      }
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get subscription details
export const getSubscriptionDetails = async (subscriptionId) => {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    
    return {
      success: true,
      data: {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        currentStart: subscription.current_start,
        currentEnd: subscription.current_end,
        totalCount: subscription.total_count,
        paidCount: subscription.paid_count,
        cancelledAt: subscription.cancelled_at
      }
    };
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate payment link
export const generatePaymentLink = async (paymentData) => {
  try {
    const options = {
      amount: Math.round(paymentData.amount * 100),
      currency: 'INR',
      description: paymentData.description,
      reference_id: paymentData.referenceId,
      callback_url: paymentData.callbackUrl,
      callback_method: 'get'
    };

    const paymentLink = await razorpay.paymentLink.create(options);
    
    return {
      success: true,
      data: {
        id: paymentLink.id,
        shortUrl: paymentLink.short_url,
        longUrl: paymentLink.long_url,
        amount: paymentLink.amount / 100,
        currency: paymentLink.currency,
        status: paymentLink.status
      }
    };
  } catch (error) {
    console.error('Error generating payment link:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (startDate, endDate) => {
  try {
    const payments = await razorpay.payments.all({
      from: startDate.getTime() / 1000,
      to: endDate.getTime() / 1000,
      count: 100
    });

    const analytics = {
      totalPayments: payments.items.length,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      paymentMethods: {}
    };

    payments.items.forEach(payment => {
      const amount = payment.amount / 100;
      analytics.totalAmount += amount;

      if (payment.status === 'captured') {
        analytics.successfulPayments++;
      } else if (payment.status === 'failed') {
        analytics.failedPayments++;
      } else {
        analytics.pendingPayments++;
      }

      const method = payment.method || 'unknown';
      analytics.paymentMethods[method] = (analytics.paymentMethods[method] || 0) + 1;
    });

    return {
      success: true,
      data: analytics
    };
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test payment service
export const testPaymentService = async () => {
  try {
    // Test Razorpay connection by fetching account details
    const account = await razorpay.accounts.fetch();
    return {
      success: true,
      message: 'Payment service is working correctly',
      data: {
        accountId: account.id,
        name: account.name
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
