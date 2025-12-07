const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
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

module.exports = mongoose.model('Department', departmentSchema);