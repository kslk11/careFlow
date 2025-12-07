const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  
  operationName: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  duration: {
    type: String, // e.g., "2-3 hours"
    trim: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
operationSchema.index({ hospitalId: 1, departmentId: 1 });
operationSchema.index({ hospitalId: 1, isActive: 1 });

module.exports = mongoose.model('Operation', operationSchema);