const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const protect  = require('../middleware/auth');

// ==================== DOCTOR REVIEW ROUTES ====================

router.post('/doctor', protect, reviewController.createDoctorReview);


router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

router.put('/doctor/:reviewId', protect, reviewController.updateDoctorReview);

router.delete('/doctor/:reviewId', protect, reviewController.deleteDoctorReview);


router.get('/can-review-doctor/:doctorId/:appointmentId', protect, reviewController.canReviewDoctor);

// ==================== HOSPITAL REVIEW ROUTES ====================


router.post('/hospital', protect, reviewController.createHospitalReview);

router.get('/hospital/:hospitalId', reviewController.getHospitalReviews);


router.put('/hospital/:reviewId', protect, reviewController.updateHospitalReview);


router.delete('/hospital/:reviewId', protect, reviewController.deleteHospitalReview);


router.get('/can-review-hospital/:hospitalId/:referralId', protect, reviewController.canReviewHospital);

// ==================== USER REVIEWS ROUTES ====================

router.get('/user/mine', protect, reviewController.getUserReviews);



module.exports = router;