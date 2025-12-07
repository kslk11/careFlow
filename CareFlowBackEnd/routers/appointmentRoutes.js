const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const  protect = require('../middleware/auth');

// User Routes
router.post('/create', protect, appointmentController.createAppointment);
router.get('/user', protect, appointmentController.getUserAppointments);
router.patch('/cancel/:id', protect,  appointmentController.cancelAppointment);

// Doctor Routes
router.get('/doctor', protect, appointmentController.getDoctorAppointments);
router.patch('/approve/:id', protect, appointmentController.approveAppointment);
router.patch('/reject/:id', protect,  appointmentController.rejectAppointment);
router.patch('/complete/:id', protect,  appointmentController.completeAppointment);

// Common Routes
router.get('/:id', protect, appointmentController.getAppointmentById);

module.exports = router;