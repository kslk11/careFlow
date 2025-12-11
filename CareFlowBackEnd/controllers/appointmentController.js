const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../utils/razorpayHelper');
const { sendEmail } = require('../services/emailService');

// @desc    Create new appointment
// @route   POST /api/appointment/create
// @access  Private (User)
exports.createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      isSelf,
      // For Others
      familyMemberName,
      familyMemberAge,
      familyMemberGender,
      familyMemberRelation,
      familyMemberAddress
    } = req.body;

    const userId = req.user.id;

    // Validate doctor exists
    const doctor = await Doctor.findById(doctorId).populate('hospitalId');
    console.log("doctor",doctor)
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    console.log("user",user)
    
    // Check if appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
        return res.status(400).json({ message: 'Appointment date must be in the future' });
    }
    console.log("user",user)
    
    // Check if doctor is available on the selected day
    const dayOfWeek = appointmentDateTime.toLocaleDateString('en-US', { weekday: 'long' });
    if (doctor.availableDays && doctor.availableDays.length > 0) {
        if (!doctor.availableDays.includes(dayOfWeek)) {
            return res.status(400).json({ 
                message: `Doctor is not available on ${dayOfWeek}. Available days: ${doctor.availableDays.join(', ')}` 
            });
        }
    }
    console.log("user",user)
    
    // Check for duplicate appointment (same doctor, same date, same time)
    const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate: {
            $gte: new Date(appointmentDate).setHours(0, 0, 0, 0),
        $lt: new Date(appointmentDate).setHours(23, 59, 59, 999)
    },
      appointmentTime,
      status: { $in: ['pending', 'approved'] }
    });
    console.log("user",user)
    
    if (existingAppointment) {
        return res.status(400).json({ 
            message: 'This time slot is already booked. Please choose another time.' 
        });
    }
    
    console.log("user",user)
    // Prepare appointment data
    const appointmentData = {
        userId,
        doctorId,
        hospitalId: doctor.hospitalId._id,
        appointmentDate,
        appointmentTime,
        reason,
        isSelf,
        consultationFee: doctor.consultationFee,
        status: 'pending'
    };
    
    console.log("user",user)
    // Add patient details based on isSelf
    if (isSelf) {
        appointmentData.patientName = user.name;
        appointmentData.patientEmail = user.email;
        appointmentData.patientPhone = user.phone;
    } else {
      appointmentData.familyMemberName = familyMemberName;
      appointmentData.familyMemberAge = familyMemberAge;
      appointmentData.familyMemberGender = familyMemberGender;
      appointmentData.familyMemberRelation = familyMemberRelation;
      appointmentData.familyMemberAddress = familyMemberAddress;
    }
    // Create appointment
    const appointment = await Appointment.create(appointmentData);
    
    console.log("user",user)
    // Populate and return
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialization qualification consultationFee')
      .populate('hospitalId', 'name address phone')
      .populate('userId', 'name email phone');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: populatedAppointment
    });

  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's appointments
// @route   GET /api/appointment/user
// @access  Private (User)
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('doctorId', 'name specialization qualification consultationFee phone email')
      .populate('hospitalId', 'name address phone email')
      .populate('prescriptionId')
      .sort({ appointmentDate: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Get User Appointments Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointment/doctor
// @access  Private (Doctor)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { doctorId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('userId', 'name email phone')
      .populate('hospitalId', 'name address')
      .populate('prescriptionId')
      .sort({ appointmentDate: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Get Doctor Appointments Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve appointment
// @route   PATCH /api/appointment/approve/:id
// @access  Private (Doctor)
exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to approve this appointment' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending appointments can be approved' });
    }

    appointment.status = 'approved';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address');

    res.status(200).json({
      message: 'Appointment approved successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Approve Appointment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject appointment
// @route   PATCH /api/appointment/reject/:id
// @access  Private (Doctor)
exports.rejectAppointment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this appointment' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending appointments can be rejected' });
    }

    appointment.status = 'rejected';
    appointment.rejectionReason = rejectionReason || 'No reason provided';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address');

    res.status(200).json({
      message: 'Appointment rejected',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Reject Appointment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete appointment
// @route   PATCH /api/appointment/complete/:id
// @access  Private (Doctor)
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved appointments can be completed' });
    }

    appointment.status = 'completed';
    await appointment.save();
    res.status(200).json({
      message: 'Appointment marked as completed',
      appointment
    });
  } catch (error) {
    console.error('Complete Appointment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PATCH /api/appointment/cancel/:id
// @access  Private (User)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel Appointment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointment/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('doctorId', 'name specialization qualification consultationFee')
      .populate('hospitalId', 'name address phone')
      .populate('prescriptionId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Get Appointment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

