const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  departments: {
    type: [String],
    required: true,
    validate: [(arr) => arr.length > 0, "Select at least one department"]
  }
  ,
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  establishedYear: {
    type: Number
  },
  website: {
    type: String
  },
  profileImage: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
   role:{
    type:String,
    default:"hospital"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mode:{
    type:String,
    enum:["light","dark"],
    default:"light"
  },
  ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        },
        breakdown: {
            5: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            1: { type: Number, default: 0 }
        },
        // Category ratings
        categories: {
            cleanliness: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            staff: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            facilities: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            waitTime: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            }
        }
    },
}, {
  timestamps: true
});
hospitalSchema.methods.updateRating = async function(ratingData) {
    this.ratings.average = ratingData.average;
    this.ratings.count = ratingData.count;
    this.ratings.breakdown = ratingData.breakdown;
    if (ratingData.categories) {
        this.ratings.categories = ratingData.categories;
    }
    await this.save();
};
module.exports = mongoose.model('Hospital', hospitalSchema);