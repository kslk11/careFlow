const express = require('express');
const router = express.Router();
const {
  createReferralFromPrescription,
  getDoctorReferrals,
  getHospitalReferrals,
  getUserReferrals,
  getReferralById,
  acceptReferral,
  rejectReferral,
  completeReferral,
  cancelReferral,
  updateIcuWardDetails,
  deleteReferral,
  getHospitalReferralsName,
  assignBedToReferral
} = require('../controllers/referController');

const protect = require('../middleware/auth');

router.post('/create-from-prescription', protect, createReferralFromPrescription);
router.get('/doctor', protect, getDoctorReferrals);
router.patch('/cancel/:id', protect, cancelReferral);
router.delete('/:id', protect, deleteReferral);

router.get('/hospital', protect,  getHospitalReferrals);
router.patch('/accept/:id', protect,  acceptReferral);
router.patch('/reject/:id', protect,  rejectReferral);
router.patch('/assign-bed/:referralId', protect, assignBedToReferral);

router.patch('/complete/:id', protect,  completeReferral);
router.patch('/update-icu-ward/:id', protect, updateIcuWardDetails);

router.get('/user', protect, getUserReferrals);

router.get('/:id', protect, getReferralById);

router.get('/gethospital/:id',protect,getHospitalReferralsName)

module.exports = router;