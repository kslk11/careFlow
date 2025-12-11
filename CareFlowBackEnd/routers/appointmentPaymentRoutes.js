const express = require('express');
const router = express.Router();
const appointmentPaymentController = require('../controllers/appointmentPaymentController');
const protect  = require('../middleware/auth');


router.post('/create-order', protect, appointmentPaymentController.createAppointmentPaymentOrder);

router.post('/verify', protect, appointmentPaymentController.verifyAppointmentPayment);

module.exports = router;