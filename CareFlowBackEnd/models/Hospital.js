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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);