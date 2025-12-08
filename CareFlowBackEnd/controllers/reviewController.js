const DoctorReview = require('../models/DoctorReview');
const HospitalReview = require('../models/HospitalReview');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const Referral = require('../models/Refer'); // Adjust name as per your model

// ==================== DOCTOR REVIEW CONTROLLERS ====================

/**
 * @desc    Create a new doctor review
 * @route   POST /api/review/doctor
 * @access  Private (User)
 */
exports.createDoctorReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { doctorId, hospitalId, appointmentId, rating, review } = req.body;

        console.log('Creating doctor review:', { userId, doctorId, appointmentId, rating });

        // Validate required fields
        if (!doctorId || !hospitalId || !appointmentId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Doctor ID, Hospital ID, Appointment ID, and Rating are required"
            });
        }

        // Validate rating value
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        // Check if appointment exists and belongs to user
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Verify appointment belongs to the user
        if (appointment.userId?.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only review your own appointments"
            });
        }

        // Check if appointment is completed
        if (appointment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: "You can only review completed appointments"
            });
        }

        // Check if user has already reviewed this doctor
        const existingReview = await DoctorReview.findOne({ 
            userId: userId, 
            doctorId: doctorId 
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this doctor",
                existingReview: existingReview
            });
        }

        // Create the review
        const doctorReview = await DoctorReview.create({
            userId,
            doctorId,
            hospitalId,
            appointmentId,
            rating,
            review: review || '',
            isVerified: true,
            status: 'active'
        });

        // Populate user details
        await doctorReview.populate('userId', 'name email');

        // Update doctor's average rating
        const ratingData = await DoctorReview.calculateAverageRating(doctorId);
        const doctor = await Doctor.findById(doctorId);
        
        if (doctor) {
            await doctor.updateRating(ratingData);
        }

        console.log('Doctor review created successfully');

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: doctorReview,
            doctorRating: ratingData
        });

    } catch (error) {
        console.error("Error creating doctor review:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating review",
            error: error.message
        });
    }
};

/**
 * @desc    Get all reviews for a specific doctor
 * @route   GET /api/review/doctor/:doctorId
 * @access  Public
 */
exports.getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        console.log('Fetching reviews for doctor:', doctorId);

        // Build query
        const query = { 
            doctorId: doctorId,
            status: 'active' // Only show active reviews
        };

        // Execute query with pagination
        const reviews = await DoctorReview.find(query)
            .populate('userId', 'name profileImage')
            .populate('hospitalId', 'name')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        // Get total count
        const count = await DoctorReview.countDocuments(query);

        // Calculate rating statistics
        const ratingData = await DoctorReview.calculateAverageRating(doctorId);

        res.status(200).json({
            success: true,
            data: reviews,
            ratings: ratingData,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalReviews: count,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Error fetching doctor reviews:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching reviews",
            error: error.message
        });
    }
};

/**
 * @desc    Update user's doctor review
 * @route   PUT /api/review/doctor/:reviewId
 * @access  Private (User - own review only)
 */
exports.updateDoctorReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;
        const { rating, review } = req.body;

        console.log('Updating doctor review:', reviewId);

        // Find the review
        const doctorReview = await DoctorReview.findById(reviewId);

        if (!doctorReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check if user owns this review
        if (doctorReview.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own reviews"
            });
        }

        // Check if review can be edited (within 30 days)
        if (!doctorReview.canEdit()) {
            return res.status(400).json({
                success: false,
                message: "Reviews can only be edited within 30 days of posting"
            });
        }

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        // Update fields
        if (rating) doctorReview.rating = rating;
        if (review !== undefined) doctorReview.review = review;

        await doctorReview.save();

        // Recalculate doctor's average rating
        const ratingData = await DoctorReview.calculateAverageRating(doctorReview.doctorId);
        const doctor = await Doctor.findById(doctorReview.doctorId);
        
        if (doctor) {
            await doctor.updateRating(ratingData);
        }

        await doctorReview.populate('userId', 'name email');

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: doctorReview,
            doctorRating: ratingData
        });

    } catch (error) {
        console.error("Error updating doctor review:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating review",
            error: error.message
        });
    }
};

/**
 * @desc    Delete doctor review (Admin only or soft delete for user)
 * @route   DELETE /api/review/doctor/:reviewId
 * @access  Private (Admin or User - own review)
 */
exports.deleteDoctorReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { reviewId } = req.params;

        console.log('Deleting doctor review:', reviewId);

        const doctorReview = await DoctorReview.findById(reviewId);

        if (!doctorReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check permissions
        const isOwner = doctorReview.userId.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this review"
            });
        }

        const doctorId = doctorReview.doctorId;

        // Admin can permanently delete, user can only soft delete
        if (isAdmin) {
            await DoctorReview.findByIdAndDelete(reviewId);
        } else {
            doctorReview.status = 'deleted';
            await doctorReview.save();
        }

        // Recalculate doctor's average rating
        const ratingData = await DoctorReview.calculateAverageRating(doctorId);
        const doctor = await Doctor.findById(doctorId);
        
        if (doctor) {
            await doctor.updateRating(ratingData);
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            doctorRating: ratingData
        });

    } catch (error) {
        console.error("Error deleting doctor review:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting review",
            error: error.message
        });
    }
};

/**
 * @desc    Check if user can review a doctor
 * @route   GET /api/review/can-review-doctor/:doctorId/:appointmentId
 * @access  Private (User)
 */
exports.canReviewDoctor = async (req, res) => {
    try {
        const userId = req.user.id;
        const { doctorId, appointmentId } = req.params;

        console.log('Checking if user can review doctor:', { userId, doctorId, appointmentId });

        // Check if appointment exists and is completed
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                canReview: false,
                message: "Appointment not found"
            });
        }

        if (appointment.userId?.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                canReview: false,
                message: "This is not your appointment"
            });
        }

        if (appointment.status !== 'completed') {
            return res.status(200).json({
                success: true,
                canReview: false,
                message: "Appointment must be completed to leave a review"
            });
        }

        // Check if user has already reviewed
        const existingReview = await DoctorReview.findOne({
            userId: userId,
            doctorId: doctorId
        });

        if (existingReview) {
            return res.status(200).json({
                success: true,
                canReview: false,
                hasReviewed: true,
                message: "You have already reviewed this doctor",
                review: existingReview
            });
        }

        // User can review
        res.status(200).json({
            success: true,
            canReview: true,
            message: "You can review this doctor"
        });

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        res.status(500).json({
            success: false,
            message: "Server error while checking review eligibility",
            error: error.message
        });
    }
};

// ==================== HOSPITAL REVIEW CONTROLLERS ====================

/**
 * @desc    Create a new hospital review
 * @route   POST /api/review/hospital
 * @access  Private (User)
 */
exports.createHospitalReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { hospitalId, referralId, rating, review, categories } = req.body;

        console.log('Creating hospital review:', { userId, hospitalId, referralId, rating });

        // Validate required fields
        if (!hospitalId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID and Rating are required"
            });
        }

        // At least referralId or appointmentId should be provided
        if (!referralId && !req.body.appointmentId) {
            return res.status(400).json({
                success: false,
                message: "Referral ID or Appointment ID is required"
            });
        }

        // Validate rating value
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        // Validate category ratings if provided
        if (categories) {
            const categoryKeys = ['cleanliness', 'staff', 'facilities', 'waitTime'];
            for (let key of categoryKeys) {
                if (categories[key] && (categories[key] < 1 || categories[key] > 5)) {
                    return res.status(400).json({
                        success: false,
                        message: `${key} rating must be between 1 and 5`
                    });
                }
            }
        }

        // If referralId is provided, verify it
        if (referralId) {
            const referral = await Referral.findById(referralId);
            
            if (!referral) {
                return res.status(404).json({
                    success: false,
                    message: "Referral not found"
                });
            }

            // Verify referral belongs to the user
            if (referral.patientId?.toString() !== userId.toString() && 
                referral.userId?.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You can only review your own referrals"
                });
            }

            // Check if referral is completed
            if (referral.status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    message: "You can only review completed referrals"
                });
            }
        }

        // Check if user has already reviewed this hospital
        const existingReview = await HospitalReview.findOne({ 
            userId: userId, 
            hospitalId: hospitalId 
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this hospital",
                existingReview: existingReview
            });
        }

        // Create the review
        const hospitalReview = await HospitalReview.create({
            userId,
            hospitalId,
            referralId: referralId || null,
            appointmentId: req.body.appointmentId || null,
            rating,
            review: review || '',
            categories: categories || {},
            isVerified: true,
            status: 'active'
        });

        // Populate user details
        await hospitalReview.populate('userId', 'name email');

        // Update hospital's average rating
        const ratingData = await HospitalReview.calculateAverageRating(hospitalId);
        const hospital = await Hospital.findById(hospitalId);
        
        if (hospital) {
            await hospital.updateRating(ratingData);
        }

        console.log('Hospital review created successfully');

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: hospitalReview,
            hospitalRating: ratingData
        });

    } catch (error) {
        console.error("Error creating hospital review:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating review",
            error: error.message
        });
    }
};

/**
 * @desc    Get all reviews for a specific hospital
 * @route   GET /api/review/hospital/:hospitalId
 * @access  Public
 */
exports.getHospitalReviews = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        console.log('Fetching reviews for hospital:', hospitalId);

        // Build query
        const query = { 
            hospitalId: hospitalId,
            status: 'active'
        };

        // Execute query with pagination
        const reviews = await HospitalReview.find(query)
            .populate('userId', 'name profileImage')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        // Get total count
        const count = await HospitalReview.countDocuments(query);

        // Calculate rating statistics
        const ratingData = await HospitalReview.calculateAverageRating(hospitalId);

        res.status(200).json({
            success: true,
            data: reviews,
            ratings: ratingData,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalReviews: count,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Error fetching hospital reviews:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching reviews",
            error: error.message
        });
    }
};

/**
 * @desc    Update user's hospital review
 * @route   PUT /api/review/hospital/:reviewId
 * @access  Private (User - own review only)
 */
exports.updateHospitalReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;
        const { rating, review, categories } = req.body;

        console.log('Updating hospital review:', reviewId);

        const hospitalReview = await HospitalReview.findById(reviewId);

        if (!hospitalReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check if user owns this review
        if (hospitalReview.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own reviews"
            });
        }

        // Check if review can be edited
        if (!hospitalReview.canEdit()) {
            return res.status(400).json({
                success: false,
                message: "Reviews can only be edited within 30 days of posting"
            });
        }

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
            return res.status(400).json({
                success: false,
                message: "Rating must be a whole number between 1 and 5"
            });
        }

        // Update fields
        if (rating) hospitalReview.rating = rating;
        if (review !== undefined) hospitalReview.review = review;
        if (categories) hospitalReview.categories = { ...hospitalReview.categories, ...categories };

        await hospitalReview.save();

        // Recalculate hospital's average rating
        const ratingData = await HospitalReview.calculateAverageRating(hospitalReview.hospitalId);
        const hospital = await Hospital.findById(hospitalReview.hospitalId);
        
        if (hospital) {
            await hospital.updateRating(ratingData);
        }

        await hospitalReview.populate('userId', 'name email');

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: hospitalReview,
            hospitalRating: ratingData
        });

    } catch (error) {
        console.error("Error updating hospital review:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating review",
            error: error.message
        });
    }
};

/**
 * @desc    Delete hospital review
 * @route   DELETE /api/review/hospital/:reviewId
 * @access  Private (Admin or User - own review)
 */
exports.deleteHospitalReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { reviewId } = req.params;

        console.log('Deleting hospital review:', reviewId);

        const hospitalReview = await HospitalReview.findById(reviewId);

        if (!hospitalReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Check permissions
        const isOwner = hospitalReview.userId.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this review"
            });
        }

        const hospitalId = hospitalReview.hospitalId;

        // Admin can permanently delete, user can only soft delete
        if (isAdmin) {
            await HospitalReview.findByIdAndDelete(reviewId);
        } else {
            hospitalReview.status = 'deleted';
            await hospitalReview.save();
        }

        // Recalculate hospital's average rating
        const ratingData = await HospitalReview.calculateAverageRating(hospitalId);
        const hospital = await Hospital.findById(hospitalId);
        
        if (hospital) {
            await hospital.updateRating(ratingData);
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            hospitalRating: ratingData
        });

    } catch (error) {
        console.error("Error deleting hospital review:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting review",
            error: error.message
        });
    }
};

/**
 * @desc    Check if user can review a hospital
 * @route   GET /api/review/can-review-hospital/:hospitalId/:referralId
 * @access  Private (User)
 */
exports.canReviewHospital = async (req, res) => {
    try {
        const userId = req.user.id;
        const { hospitalId, referralId } = req.params;

        console.log('Checking if user can review hospital:', { userId, hospitalId, referralId });

        // Check if referral exists and is completed
        const referral = await Referral.findById(referralId);

        if (!referral) {
            return res.status(404).json({
                success: false,
                canReview: false,
                message: "Referral not found"
            });
        }

        if (referral.patientId?.toString() !== userId.toString() && 
            referral.userId?.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                canReview: false,
                message: "This is not your referral"
            });
        }

        if (referral.status !== 'completed') {
            return res.status(200).json({
                success: true,
                canReview: false,
                message: "Referral must be completed to leave a review"
            });
        }

        // Check if user has already reviewed
        const existingReview = await HospitalReview.findOne({
            userId: userId,
            hospitalId: hospitalId
        });

        if (existingReview) {
            return res.status(200).json({
                success: true,
                canReview: false,
                hasReviewed: true,
                message: "You have already reviewed this hospital",
                review: existingReview
            });
        }

        // User can review
        res.status(200).json({
            success: true,
            canReview: true,
            message: "You can review this hospital"
        });

    } catch (error) {
        console.error("Error checking review eligibility:", error);
        res.status(500).json({
            success: false,
            message: "Server error while checking review eligibility",
            error: error.message
        });
    }
};

// ==================== USER'S REVIEWS ====================

/**
 * @desc    Get all reviews by logged-in user
 * @route   GET /api/review/user/mine
 * @access  Private (User)
 */
exports.getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log('Fetching all reviews for user:', userId);

        // Get doctor reviews
        const doctorReviews = await DoctorReview.find({ userId: userId, status: 'active' })
            .populate('doctorId', 'name specialization')
            .populate('hospitalId', 'name')
            .sort('-createdAt')
            .lean();

        // Get hospital reviews
        const hospitalReviews = await HospitalReview.find({ userId: userId, status: 'active' })
            .populate('hospitalId', 'name')
            .sort('-createdAt')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                doctorReviews: doctorReviews,
                hospitalReviews: hospitalReviews,
                totalReviews: doctorReviews.length + hospitalReviews.length
            }
        });

    } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching reviews",
            error: error.message
        });
    }
};