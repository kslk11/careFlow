const { createRazorpayOrder, verifyRazorpaySignature, fetchPaymentDetails } = require('../utils/razorpayHelper');
const Bill = require('../models/Billmodel');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Create Razorpay order for bill payment
 * @route   POST /api/payment/create-order
 * @access  Private (User)
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { billId, amount, paymentType, emiOption } = req.body;

    console.log('Creating payment order:', { billId, amount, paymentType });

    // Validate input
    if (!billId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Bill ID and amount are required',
      });
    }

    // Find the bill
    const bill = await Bill.findById(billId)
      .populate('hospitalId', 'name')
      .populate('userId', 'name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Verify user owns this bill
    if (bill.userId && bill.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to pay this bill',
      });
    }

    // Calculate remaining amount
    const remainingAmount = bill.totalAmount - bill.amountPaid;

    // Validate payment amount
    if (amount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount exceeds remaining balance of ₹${remainingAmount}`,
      });
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      amount,
      `bill_${bill.billNumber}_${Date.now()}`,
      {
        billId: bill._id.toString(),
        billNumber: bill.billNumber,
        userId: userId,
        paymentType: paymentType || 'full',
        emiOption: emiOption || null,
        hospitalName: bill.hospitalId?.name || 'Hospital',
      }
    );

    // Return order details to frontend
    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        billNumber: bill.billNumber,
        hospitalName: bill.hospitalId?.name,
        patientName: bill.patientName,
      },
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify payment and update bill
 * @route   POST /api/payment/verify
 * @access  Private (User)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId,
      amount,
      paymentType,
      emiOption,
    } = req.body;

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);

    // Find the bill
    const bill = await Bill.findById(billId)
      .populate('hospitalId', 'name email')
      .populate('userId', 'name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Convert amount from paise to rupees
    const amountInRupees = paymentDetails.amount / 100;


bills.addPaymentToHistory({
    amount: amountInRupees,
    paymentMethod: paymentDetails.method,
    transactionId: razorpay_payment_id,
    paymentType: paymentType,
    emiOption: emiOption,
    status: paymentDetails.status,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id
});

await bill.save();
    // Send payment confirmation email
    if (bill.userId?.email || bill.patientEmail) {
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .label { font-weight: bold; color: #666; display: inline-block; width: 150px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Successful</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <h2>Thank you for your payment!</h2>
              <p>Your payment has been processed successfully.</p>

              <div class="info-box">
                <p><span class="label">Bill Number:</span> ${bill.billNumber}</p>
                <p><span class="label">Hospital:</span> ${bill.hospitalId?.name}</p>
                <p><span class="label">Amount Paid:</span> ₹${amountInRupees.toLocaleString()}</p>
                <p><span class="label">Payment ID:</span> ${razorpay_payment_id}</p>
                <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
                <p><span class="label">Payment Method:</span> ${paymentDetails.method}</p>
              </div>

              <div class="info-box">
                <p><span class="label">Bill Total:</span> ₹${bill.totalAmount.toLocaleString()}</p>
                <p><span class="label">Total Paid:</span> ₹${bill.amountPaid.toLocaleString()}</p>
                <p><span class="label">Remaining:</span> ₹${remainingAmount.toLocaleString()}</p>
                <p><span class="label">Status:</span> ${bill.paymentStatus.toUpperCase()}</p>
              </div>

              <p style="margin-top: 30px;">
                <strong>Keep this email for your records.</strong><br>
                <em>CareFlow System</em>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated payment receipt from CareFlow</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        bill.userId?.email || bill.patientEmail,
        `Payment Receipt - ${bill.billNumber}`,
        emailHTML
      );
    }

    console.log('✅ Payment verified and bill updated');

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        billId: bill._id,
        billNumber: bill.billNumber,
        amountPaid: bill.amountPaid,
        remainingAmount: remainingAmount,
        paymentStatus: bill.paymentStatus,
        transactionId: razorpay_payment_id,
      },
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Handle payment failure
 * @route   POST /api/payment/failure
 * @access  Private (User)
 */
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, paymentId, error } = req.body;

    console.log('Payment failed:', { orderId, paymentId, error });

    // You can log this to database for analytics
    // Or send notification to user

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
    });

  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure',
    });
  }
};

/**
 * @desc    Get payment history for a bill
 * @route   GET /api/payment/history/:billId
 * @access  Private (User)
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { billId } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Verify user owns this bill
    if (bill.userId && bill.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      data: bill.paymentHistory,
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};