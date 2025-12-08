const mongoose = require('mongoose');

const hospitalReviewSchema = new mongoose.Schema({
    // User who is giving the review
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Hospital being reviewed
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },

    // Proof of visit (referral or appointment)
    referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referral' // Adjust model name as per your schema
    },

    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
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

    // Rating categories (optional detailed rating)
    categories: {
        cleanliness: {
            type: Number,
            min: 1,
            max: 5
        },
        staff: {
            type: Number,
            min: 1,
            max: 5
        },
        facilities: {
            type: Number,
            min: 1,
            max: 5
        },
        waitTime: {
            type: Number,
            min: 1,
            max: 5
        }
    },

    // Is this a verified review
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

    // Hospital's response (optional feature)
    hospitalResponse: {
        response: String,
        respondedAt: Date,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }

}, {
    timestamps: true
});

// Compound index to ensure one review per user per hospital
hospitalReviewSchema.index({ userId: 1, hospitalId: 1 }, { unique: true });

// Index for querying by hospital
hospitalReviewSchema.index({ hospitalId: 1, status: 1 });

// Index for querying by user
hospitalReviewSchema.index({ userId: 1 });

// Index for querying by referral
hospitalReviewSchema.index({ referralId: 1 });

// Static method to calculate average rating for a hospital
// ✅ NEW CODE - CORRECT
hospitalReviewSchema.statics.calculateAverageRating = async function(hospitalId) {
    const result = await this.aggregate([
        {
            $match: {
                hospitalId: new mongoose.Types.ObjectId(hospitalId), // ✅ FIXED with 'new'
                status: 'active'
            }
        },
        {
            $group: {
                _id: '$hospitalId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                // Category averages
                avgCleanliness: { $avg: '$categories.cleanliness' },
                avgStaff: { $avg: '$categories.staff' },
                avgFacilities: { $avg: '$categories.facilities' },
                avgWaitTime: { $avg: '$categories.waitTime' }
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
            },
            categories: {
                cleanliness: Math.round((result[0].avgCleanliness || 0) * 10) / 10,
                staff: Math.round((result[0].avgStaff || 0) * 10) / 10,
                facilities: Math.round((result[0].avgFacilities || 0) * 10) / 10,
                waitTime: Math.round((result[0].avgWaitTime || 0) * 10) / 10
            }
        };
    }

    return {
        average: 0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categories: { cleanliness: 0, staff: 0, facilities: 0, waitTime: 0 }
    };
};
// Instance method to check if user can edit review (within 30 days)
hospitalReviewSchema.methods.canEdit = function() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt > thirtyDaysAgo;
};

module.exports = mongoose.model('HospitalReview', hospitalReviewSchema);