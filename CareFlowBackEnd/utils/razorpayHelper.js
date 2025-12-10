const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * @param {Number} amount - Amount in rupees (will be converted to paise)
 * @param {String} receipt - Unique receipt ID (billNumber or billId)
 * @param {Object} notes - Additional data to attach
 */
const createRazorpayOrder = async (amount, receipt, notes = {}) => {
  try {
    // Razorpay expects amount in paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: notes,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);
    return order;

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
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
 * @param {String} webhookSignature - Razorpay webhook signature from header
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