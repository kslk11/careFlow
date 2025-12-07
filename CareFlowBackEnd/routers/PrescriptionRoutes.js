const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionByAppointment,
  updatePrescription,
  deletePrescription
} = require('../controllers/Prescriptioncontroller');
const protect = require('../middleware/auth');


router.post('/create', protect, createPrescription);
router.get('/doctor', protect, getDoctorPrescriptions);
router.put('/update', protect, updatePrescription);
router.delete('/delete', protect, deletePrescription);


router.get('/patient', protect, getPatientPrescriptions);


router.get('/appointment/:appointmentId', protect, getPrescriptionByAppointment);

module.exports = router;