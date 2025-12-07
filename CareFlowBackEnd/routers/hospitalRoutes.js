const express = require('express');
const router = express.Router();
const hospitalController= require('../controllers/hospitalController');
const protect = require('../middleware/auth');
// const roleCheck = require('../middleware/roleCheck');

router.post('/register', hospitalController.registerHospital);
router.post('/login', hospitalController.loginHospital);
router.get('/requests', protect, hospitalController.getHospitalRequests);
router.patch('/approve/:id', protect, hospitalController.approveHospital);
router.patch('/reject/:id', protect, hospitalController.rejectHospital);
router.delete('/delete/:id', protect, hospitalController.deleteHospital);
router.patch('/retrieve/:id', protect,  hospitalController.retrieveHospital);
router.get('/doctors', protect, hospitalController.getHospitalDoctors);
router.put('/profile', protect, hospitalController.updateHospitalProfile);
router.get('/approved', hospitalController.getApprovedHospitals);
router.get('/rejected',protect, hospitalController.getRejectedHospitals);
router.get('/deleted',protect, hospitalController.getDeletedHospitals);
router.get('/getdocs',protect, hospitalController.getDoctorHospitalAs);
router.get('/getdoctorsparams/:id', hospitalController.getDoctorHospitalParams);
// router.get('/resetpassword',protect, hospitalController.resetPassword);
router.get('/getProfile',protect, hospitalController.hospitalDetails);
router.get('/modeChange', protect, hospitalController.mode);
router.get('/all',  hospitalController.getHospitals);


module.exports = router;