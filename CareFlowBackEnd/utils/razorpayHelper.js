const Razorpay = require('razorpay');
const crypto = require('crypto');

// ✅ CHECK ENVIRONMENT VARIABLES FIRST
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY CREDENTIALS MISSING!');
  console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set ✅' : 'Missing ❌');
  console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set ✅' : 'Missing ❌');
}

// Initialize Razorpay instance
let razorpayInstance;

try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay instance initialized');
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
}

/**
 * Create Razorpay Order
 * @param {Number} amount - Amount in rupees (will be converted to paise)
 * @param {String} receipt - Unique receipt ID
 * @param {Object} notes - Additional data
 */
const createRazorpayOrder = async (amount, receipt, notes = {}) => {
  try {
    console.log('🚀 Creating Razorpay order...');
    console.log('Amount (₹):', amount);
    console.log('Receipt:', receipt);
    
    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount. Amount must be greater than 0.');
    }

    if (!receipt) {
      throw new Error('Receipt ID is required');
    }

    // Check if Razorpay instance exists
    if (!razorpayInstance) {
      throw new Error('Razorpay instance not initialized. Check your API keys.');
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    console.log('Amount in paise:', amountInPaise);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: notes,
      payment_capture: 1, // Auto capture payment
    };

    console.log('Order options:', options);

    const order = await razorpayInstance.orders.create(options);
    
    console.log('✅ Razorpay order created successfully:', order.id);
    
    return order;

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Throw a more descriptive error
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

/**
 * Verify Razorpay Payment Signature
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    console.log('🔍 Verifying payment signature...');
    
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = generated_signature === signature;
    
    if (isValid) {
      console.log('✅ Payment signature verified');
    } else {
      console.log('❌ Invalid payment signature');
      console.log('Expected:', generated_signature);
      console.log('Received:', signature);
    }

    return isValid;

  } catch (error) {
    console.error('❌ Error verifying signature:', error);
    return false;
  }
};

/**
 * Fetch Payment Details
 * @param {String} paymentId - Razorpay payment ID
 */
const fetchPaymentDetails = async (paymentId) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay instance not initialized');
    }

    const payment = await razorpayInstance.payments.fetch(paymentId);
    console.log('✅ Payment details fetched:', paymentId);
    return payment;
    
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Create Refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Amount to refund in rupees
 */
const createRefund = async (paymentId, amount) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay instance not initialized');
    }

    const amountInPaise = Math.round(amount * 100);
    
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amountInPaise,
    });

    console.log('✅ Refund created:', refund.id);
    return refund;

  } catch (error) {
    console.error('❌ Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
};

/**
 * Verify Webhook Signature
 * @param {String} webhookBody - Raw webhook body
 * @param {String} webhookSignature - Razorpay webhook signature
 * @param {String} webhookSecret - Your webhook secret
 */
const verifyWebhookSignature = (webhookBody, webhookSignature, webhookSecret) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === webhookSignature;
    
  } catch (error) {
    console.error('❌ Error verifying webhook:', error);
    return false;
  }
};

module.exports = {
  razorpayInstance,
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchPaymentDetails,
  createRefund,
  verifyWebhookSignature,
};