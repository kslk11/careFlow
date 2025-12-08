const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  departments: [{
    type: String,
    required: true
  }],
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  profileImage: {
    type: String
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: "doctor"
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  availableTimeSlots: {
    start: {
      type: String,  
      default: ""
    },
    end: {
      type: String,  
      default: ""
    }
  },
  bio: {
    type: String,
    default: ""
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
        }
    },
  mode:{
    type:String,
    enum:["light","dark"],
    default:"light"
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);