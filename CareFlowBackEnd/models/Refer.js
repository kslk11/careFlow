const mongoose = require('mongoose');

const referSchema = new mongoose.Schema({
  referringDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  
  operationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Operation'
  },
  assignedBedId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed'
  },
  patientName: {
    type: String,
    required: true
  },
  
  patientPhone: {
    type: String,
    required: true
  },
  
  patientEmail: {
    type: String
  },
  
  reason: {
    type: String,
    required: true,
    trim: true
  },
  
  medicalNotes: {
    type: String,
    trim: true
  },
  
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  careType: {
    type: String,
    enum: ['ICU', 'Ward', 'General Ward', 'OPD', 'Emergency', 'Consultation'],
    required: true
  },
  
  icuWardDetails: {
    type: {
      type: String,
      enum: ['ICU', 'Ward', 'General Ward', 'None']
    },
    roomNumber: String,
    bedNumber: String,
    assignedAt: Date
  },
  
  estimatedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  finalPrice: {
    type: Number,
    min: 0
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  
  paymentDetails: {
    amountPaid: {
      type: Number,
      default: 0
    },
    paymentDate: Date,
    paymentMethod: String,
    transactionId: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  hospitalResponse: {
    type: String,
    trim: true
  },
  
  rejectionReason: {
    type: String,
    trim: true
  },
  
  appointmentDate: {
    type: Date
  },
  
  appointmentTime: {
    type: String
  },
  
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  
  estimatedStayDays: {
    type: Number,
    min: 0
  },
  
  documents: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

referSchema.index({ referringDoctorId: 1, createdAt: -1 });
referSchema.index({ hospitalId: 1, status: 1 });
referSchema.index({ userId: 1 });
referSchema.index({ prescriptionId: 1 });
referSchema.index({ operationId: 1 });

module.exports = mongoose.model('Refer', referSchema);