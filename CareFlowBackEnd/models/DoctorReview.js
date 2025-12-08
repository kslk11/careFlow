const mongoose = require('mongoose');

const doctorReviewSchema = new mongoose.Schema({
    // User who is giving the review
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Doctor being reviewed
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },

    // Hospital context (where the appointment happened)
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },

    // Proof of appointment (to verify legitimate review)
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },

    // Rating (1 to 5 stars)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number'
        }
    },

    // Written review (optional)
    review: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },

    // Is this a verified review (appointment was completed)
    isVerified: {
        type: Boolean,
        default: true
    },

    // Review status (for moderation)
    status: {
        type: String,
        enum: ['active', 'reported', 'hidden', 'deleted'],
        default: 'active'
    },

    // Helpful count (optional feature)
    helpfulCount: {
        type: Number,
        default: 0
    },

    // Report count (for moderation)
    reportCount: {
        type: Number,
        default: 0
    },

    // Doctor's response (optional feature)
    doctorResponse: {
        response: String,
        respondedAt: Date
    }

}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Compound index to ensure one review per user per doctor
doctorReviewSchema.index({ userId: 1, doctorId: 1 }, { unique: true });

// Index for querying by doctor
doctorReviewSchema.index({ doctorId: 1, status: 1 });

// Index for querying by user
doctorReviewSchema.index({ userId: 1 });

// Index for querying by appointment
doctorReviewSchema.index({ appointmentId: 1 });

// Static method to calculate average rating for a doctor
doctorReviewSchema.statics.calculateAverageRating = async function(doctorId) {
    const result = await this.aggregate([
        {
            $match: {
                doctorId: new mongoose.Types.ObjectId(doctorId), // ✅ FIXED with 'new'
                status: 'active'
            }
        },
        {
            $group: {
                _id: '$doctorId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
            }
        }
    ]);

    if (result.length > 0) {
        return {
            average: Math.round(result[0].averageRating * 10) / 10,
            count: result[0].totalReviews,
            breakdown: {
                5: result[0].rating5,
                4: result[0].rating4,
                3: result[0].rating3,
                2: result[0].rating2,
                1: result[0].rating1
            }
        };
    }

    return {
        average: 0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
};

// Instance method to check if user can edit review (within 30 days)
doctorReviewSchema.methods.canEdit = function() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt > thirtyDaysAgo;
};

module.exports = mongoose.model('DoctorReview', doctorReviewSchema);