import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getRazorpayInstance, isRazorpayConfigured } from '../config/razorpay.js';

// @desc    Complete payment process (COD or Online)
// @route   POST /api/payments/process
// @access  Private
export const processPayment = asyncHandler(async (req, res) => {
  const { 
    paymentMethod, 
    shippingAddress, 
    notes,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature 
  } = req.body;

  // Validate payment method
  if (!['razorpay', 'cod'].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment method'
    });
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Validate stock and prepare order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    
    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `${product.name} is not available`
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} ${product.name} available in stock`
      });
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      weight: product.weight,
      weightUnit: product.weightUnit
    });

    subtotal += product.price * item.quantity;
  }

  // Calculate costs
  const shippingCost = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.05; // 5% GST
  const discount = cart.discountAmount || 0;
  const codCharge = paymentMethod === 'cod' ? 20 : 0;
  const totalAmount = subtotal + shippingCost + tax - discount + codCharge;

  // Handle payment verification for online payments
  if (paymentMethod === 'razorpay') {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are required for online payments'
      });
    }

    // Verify Razorpay signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress: {
      street: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.pincode,
      country: 'India'
    },
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
    orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'confirmed',
    subtotal,
    shippingCost,
    tax,
    discount,
    totalAmount,
    notes,
    razorpayOrderId: paymentMethod === 'razorpay' ? razorpayOrderId : undefined,
    razorpayPaymentId: paymentMethod === 'razorpay' ? razorpayPaymentId : undefined,
    isSeasonalOrder: cart.items.some(item => item.product.isSeasonal)
  });

  // Update product stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity }
    });
  }

  // Clear cart
  await cart.clearCart();

  // Populate order details
  await order.populate({
    path: 'items.product',
    select: 'name images'
  });

  res.status(201).json({
    success: true,
    message: paymentMethod === 'cod' 
      ? 'Order placed successfully! You will pay on delivery.' 
      : 'Payment successful! Order confirmed.',
    data: { 
      order,
      paymentMethod,
      totalAmount
    }
  });
});

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount < 1) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required'
    });
  }

  const razorpayInstance = getRazorpayInstance();
  if (!razorpayInstance) {
    return res.status(500).json({
      success: false,
      message: 'Payment service not configured'
    });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId // Our order ID
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed: Missing payment details'
    });
  }

  try {
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Update order with payment details
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'completed';
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        verified: true
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await getRazorpayInstance().payments.fetch(paymentId);

    res.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          orderId: payment.order_id,
          createdAt: payment.created_at
        }
      }
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

// @desc    Refund payment
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
export const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  try {
    const refundOptions = {
      amount: amount ? Math.round(amount * 100) : undefined, // Amount in paise
      speed: 'normal',
      notes: {
        reason: reason || 'Customer request'
      }
    };

    const refund = await getRazorpayInstance().payments.refund(paymentId, refundOptions);

    // Update order status if refund is successful
    if (refund.status === 'processed') {
      const order = await Order.findOne({ razorpayPaymentId: paymentId });
      if (order) {
        order.paymentStatus = 'refunded';
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          createdAt: refund.created_at
        }
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Credit/Debit Card & UPI',
      description: 'Pay securely with cards, UPI, net banking',
      icon: '💳',
      enabled: isRazorpayConfigured()
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: '💰',
      enabled: true
    }
  ];

  res.json({
    success: true,
    data: { paymentMethods }
  });
});

// @desc    Get Razorpay configuration
// @route   GET /api/payments/config
// @access  Public
export const getRazorpayConfig = asyncHandler(async (req, res) => {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Payment service not configured'
    });
  }

  res.json({
    success: true,
    data: {
      keyId: process.env.RAZORPAY_KEY_ID,
      currency: 'INR',
      name: 'Organic Hub',
      description: 'Organic products payment',
      theme: {
        color: '#16a34a'
      }
    }
  });
});

// @desc    Webhook handler for Razorpay events
// @route   POST /api/payments/webhook
// @access  Public
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (!signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing signature'
    });
  }

  try {
    // Verify webhook signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Payment successful
        await handlePaymentSuccess(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        // Payment failed
        await handlePaymentFailure(event.payload.payment.entity);
        break;
      
      case 'refund.processed':
        // Refund processed
        await handleRefundProcessed(event.payload.refund.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Helper functions for webhook handling
async function handlePaymentSuccess(payment) {
  try {
    const order = await Order.findOne({ razorpayPaymentId: payment.id });
    if (order) {
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      await order.save();
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(payment) {
  try {
    const order = await Order.findOne({ razorpayPaymentId: payment.id });
    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleRefundProcessed(refund) {
  try {
    const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
    if (order) {
      order.paymentStatus = 'refunded';
      await order.save();
    }
  } catch (error) {
    console.error('Error handling refund processed:', error);
  }
}
