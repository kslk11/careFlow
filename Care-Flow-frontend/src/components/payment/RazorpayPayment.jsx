import React, { useState } from 'react';
import axios from 'axios';

/**
 * RazorpayPayment Component
 * Handles Razorpay payment integration
 */
const RazorpayPayment = ({ 
  bill, 
  amount, 
  paymentType = 'full', 
  emiOption = null,
  onSuccess, 
  onFailure,
  buttonText = 'Pay Now',
  buttonClass = '',
  darkMode = false 
}) => {
  const [loading, setLoading] = useState(false);
// console.log(bill,amount)
  const token = localStorage.getItem('UserToken');
  const userInfo = JSON.parse(localStorage.getItem('Userinfo'));

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Initialize Razorpay Payment
  const initiatePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create Razorpay order from backend
      const orderResponse = await axios.post(
        'http://localhost:8000/api/payment/create-order',
        {
          billId: bill._id,
          amount: amount,
          paymentType: paymentType,
          emiOption: emiOption
        },
        config
      );

      const { orderId, amount: orderAmount, currency, keyId } = orderResponse.data.data;

      // Step 2: Configure Razorpay options
      const options = {
        key: keyId, // Razorpay Key ID from backend
        amount: orderAmount, // Amount in paise
        currency: currency,
        name: 'CareFlow',
        description: `Payment for Bill #${bill.billNumber}`,
        order_id: orderId,
        
        // Prefill customer details
        prefill: {
          name: userInfo?.user?.name || bill.patientName,
          email: userInfo?.user?.email || bill.patientEmail,
          contact: userInfo?.user?.phone || bill.patientPhone
        },

        // Theme customization
        theme: {
          color: '#06b6d4' // Cyan color to match your app
        },

        // Notes
        notes: {
          billNumber: bill.billNumber,
          hospitalName: bill.hospitalId?.name
        },

        // Handler for successful payment
        handler: async function (response) {
          console.log('Payment successful:', response);
          await handlePaymentSuccess(response);
        },

        // Modal options
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setLoading(false);
            if (onFailure) {
              onFailure({ message: 'Payment cancelled by user' });
            }
          },
          escape: true,
          backdropclose: false
        }
      };

      // Step 3: Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        handlePaymentFailure(response.error);
      });

      razorpay.open();
      setLoading(false);

    } catch (error) {
      console.error('Error initiating payment:', error);
      setLoading(false);
      alert( 'Failed to initiate payment');
      
      if (onFailure) {
        onFailure(error.response?.data || error);
      }
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response) => {
    try {
      setLoading(true);

      // Verify payment with backend
      const verifyResponse = await axios.post(
        'http://localhost:8000/api/payment/verify',
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          billId: bill._id,
          amount: amount,
          paymentType: paymentType,
          emiOption: emiOption
        },
        config
      );

      console.log('Payment verified:', verifyResponse.data);

      // Show success message
      alert('✅ Payment Successful! Receipt sent to your email.');

      // Call success callback
      if (onSuccess) {
        onSuccess(verifyResponse.data);
      }

      setLoading(false);

    } catch (error) {
      console.error('Error verifying payment:', error);
      setLoading(false);
      alert('Payment completed but verification failed. Please contact support.');
      
      if (onFailure) {
        onFailure(error.response?.data || error);
      }
    }
  };

  // Handle failed payment
  const handlePaymentFailure = async (error) => {
    try {
      // Log failure to backend
      await axios.post(
        'http://localhost:8000/api/payment/failure',
        {
          orderId: error.metadata?.order_id,
          paymentId: error.metadata?.payment_id,
          error: {
            code: error.code,
            description: error.description,
            reason: error.reason
          }
        },
        config
      );

      alert(`❌ Payment Failed: ${error.description}`);

      if (onFailure) {
        onFailure(error);
      }

    } catch (err) {
      console.error('Error logging payment failure:', err);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={initiatePayment}
      disabled={loading}
      className={buttonClass || `w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
        loading
          ? 'bg-gray-400 cursor-not-allowed'
          : darkMode
          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Processing...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {buttonText}
        </span>
      )}
    </button>
  );
};

export default RazorpayPayment;