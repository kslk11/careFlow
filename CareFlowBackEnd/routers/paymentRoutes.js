const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const  protect  = require('../middleware/auth');


router.post('/create-order', protect, paymentController.createPaymentOrder);


router.post('/verify', protect, paymentController.verifyPayment);


router.post('/failure', protect, paymentController.handlePaymentFailure);


router.get('/history/:billId', protect, paymentController.getPaymentHistory);

module.exports = router;