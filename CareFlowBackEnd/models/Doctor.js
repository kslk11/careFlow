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
  mode:{
    type:String,
    enum:["light","dark"],
    default:"light"
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);