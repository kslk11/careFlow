const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User'); // ✅ ADD THIS
const { createRazorpayOrder, verifyRazorpaySignature } = require('../utils/razorpayHelper');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Create payment order for appointment booking
 * @route   POST /api/appointment-payment/create-order
 * @access  Private (User)
 */
exports.createAppointmentPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      doctorId, 
      hospitalId, 
      date, 
      time,
      reason,
      isSelf,
      familyMemberName,
      familyMemberAge,
      familyMemberGender,
      familyMemberRelation,
      familyMemberAddress
    } = req.body;

    console.log('Creating appointment payment order:', { doctorId, date, time });

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, date, and time are required',
      });
    }

    // ✅ GET USER DETAILS
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId).populate('hospitalId', 'name address');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const consultationFee = doctor.consultationFee || 500;

    // ✅ CREATE APPOINTMENT WITH PATIENT DETAILS
    const appointmentData = {
      userId: userId,
      doctorId: doctorId,
      hospitalId: hospitalId || doctor.hospitalId?._id,
      
      // ✅ ADD PATIENT DETAILS FROM USER
      patientName: user.name,
      patientPhone: user.phone,
      patientEmail: user.email || null,
      
      // Appointment Details
      appointmentDate: date,
      appointmentTime: time,
      status: 'pending',
      consultationFee: consultationFee,
      paymentStatus: 'pending',
      reason: reason || '',
    };

    // ✅ HANDLE FAMILY MEMBER BOOKING
    if (isSelf === false && familyMemberName) {
      // If booking for family member, update patient details
      appointmentData.patientName = familyMemberName;
      appointmentData.patientAge = familyMemberAge;
      appointmentData.patientGender = familyMemberGender;
      appointmentData.relation = familyMemberRelation;
      appointmentData.patientAddress = familyMemberAddress;
    }

    console.log('Appointment data:', appointmentData);

    const appointment = await Appointment.create(appointmentData);

const razorpayOrder = await createRazorpayOrder(
  consultationFee,
  `apt_${appointment._id.toString().slice(-20)}`, // Only last 20 chars of ID + prefix = 24 chars
  {
    appointmentId: appointment._id.toString(),
    doctorId: doctorId,
    userId: userId,
    purpose: 'consultation_fee',
    date: date,
    time: time,
  }
);

    // Save order ID to appointment
    appointment.razorpayOrderId = razorpayOrder.id;
    await appointment.save();

    console.log('✅ Appointment created and payment order generated');

    res.status(200).json({
      success: true,
      data: {
        appointmentId: appointment._id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        doctorName: doctor.name,
        consultationFee: consultationFee,
      },
    });

  } catch (error) {
    console.error('Error creating appointment payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
};
exports.verifyAppointmentPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentId,
    } = req.body;

    console.log('Verifying appointment payment:', { appointmentId, razorpay_payment_id });

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name address')
      .populate('userId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Verify user owns this appointment
    if (appointment.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Update appointment with payment details
    appointment.paymentStatus = 'paid';
    appointment.paymentMethod = 'razorpay';
    appointment.transactionId = razorpay_payment_id;
    appointment.razorpayPaymentId = razorpay_payment_id;
    appointment.paidAt = new Date();
    
    await appointment.save();

    // Send confirmation email
    if (appointment.userId.email) {
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .label { font-weight: bold; color: #666; display: inline-block; width: 150px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Appointment Confirmed</h1>
            </div>
            <div class="content">
              <h2>Hello ${appointment.userId.name}!</h2>
              <p>Your appointment has been booked successfully.</p>

              <div class="info-box">
                <p><span class="label">Doctor:</span> Dr. ${appointment.doctorId.name}</p>
                <p><span class="label">Specialization:</span> ${appointment.doctorId.specialization}</p>
                <p><span class="label">Hospital:</span> ${appointment.hospitalId.name}</p>
                <p><span class="label">Date:</span> ${new Date(appointment.date).toLocaleDateString()}</p>
                <p><span class="label">Time:</span> ${appointment.time}</p>
              </div>

              <div class="info-box">
                <p><span class="label">Consultation Fee:</span> ₹${appointment.consultationFee}</p>
                <p><span class="label">Payment Status:</span> PAID</p>
                <p><span class="label">Payment ID:</span> ${razorpay_payment_id}</p>
              </div>

              <p style="margin-top: 30px;">
                <strong>Please arrive 15 minutes before your scheduled time.</strong><br>
                <em>CareFlow System</em>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail(
        appointment.userId.email,
        `Appointment Confirmed - ${new Date(appointment.date).toLocaleDateString()}`,
        emailHTML
      );
    }

    console.log('✅ Appointment payment verified');

    res.status(200).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointmentId: appointment._id,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        transactionId: razorpay_payment_id,
      },
    });

  } catch (error) {
    console.error('Error verifying appointment payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};