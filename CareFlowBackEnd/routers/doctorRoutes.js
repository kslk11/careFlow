const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/register',protect, doctorController.registerDoctor);
router.post('/login', doctorController.loginDoctor);
router.get('/hospital', protect, doctorController.getDoctorHospital);
router.put('/profile', protect,  doctorController.updateDoctorProfile);
router.get('/all', doctorController.getAllDoctors);
router.get('/getDoctor',protect, doctorController.getDoctorById);
router.get('/getAppointments',protect, doctorController.getAppointmentbyparams);
router.get('/getDoctor/:id',protect, doctorController.getDoctorByIdParams);
router.get('/mode', protect, doctorController.mode);


module.exports = router;