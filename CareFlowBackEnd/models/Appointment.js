const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },

  // Appointment Details
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true  // Format: "10:00 AM"
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },

  // Patient Information
  isSelf: {
    type: Boolean,
    required: true,
    default: true
  },
  
  // For Self (uses User data)
  patientName: {
    type: String,
    required: function() { return this.isSelf; }
  },
  patientEmail: {
    type: String,
    required: function() { return this.isSelf; }
  },
  patientPhone: {
    type: String,
    required: function() { return this.isSelf; }
  },
  
  // For Others (family member - manual entry)
  familyMemberName: {
    type: String,
    required: function() { return !this.isSelf; }
  },
  familyMemberAge: {
    type: Number,
    required: function() { return !this.isSelf; },
    min: 0
  },
  familyMemberGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: function() { return !this.isSelf; }
  },
  familyMemberRelation: {
    type: String,
    required: function() { return !this.isSelf; }
  },
  familyMemberAddress: {
    type: String,
    required: function() { return !this.isSelf; }
  },

  // Status Management
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ""
  },

  // Consultation Details
  consultationFee: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  
  // Additional Notes
  notes: {
    type: String,
    default: ""
  },

  // Prescription Reference
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }

}, { timestamps: true });

// Indexes for faster queries
appointmentSchema.index({ userId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);