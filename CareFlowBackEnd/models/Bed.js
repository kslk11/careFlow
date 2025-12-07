const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  
  bedType: {
    type: String,
    enum: ['Normal', 'AC', 'Luxury', 'ICU', 'General Ward'],
    required: true
  },
  
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  bedNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  floor: {
    type: String,
    trim: true
  },
  
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  currentPatient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    patientName: String,
    admissionDate: Date,
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Refer'
    }
  },
  
  amenities: [{
    type: String,
    trim: true
  }],
  
  description: {
    type: String,
    trim: true
  },
  
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance', 'Reserved'],
    default: 'Available'
  },
  
  lastMaintenanceDate: {
    type: Date
  }
}, {
  timestamps: true
});

bedSchema.index({ hospitalId: 1, bedType: 1 });
bedSchema.index({ hospitalId: 1, isAvailable: 1 });
bedSchema.index({ hospitalId: 1, status: 1 });

bedSchema.index({ hospitalId: 1, roomNumber: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);