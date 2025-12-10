const cron = require('node-cron');
const { sendEmail } = require('../services/emailService');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Bed = require('../models/Bed');
const Operation = require('../models/Operation');
const Referral = require('../models/Refer');

// ==================== HOSPITAL DAILY REPORT ====================
const sendHospitalDailyReport = async () => {
  try {
    console.log('📊 Starting Hospital Daily Reports...');

    const hospitals = await Hospital.find();

    for (const hospital of hospitals) {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch data for hospital
      const todayAppointments = await Appointment.countDocuments({
        hospitalId: hospital._id,
        date: { $gte: today, $lt: tomorrow }
      });

      const todayOperations = await Operation.countDocuments({
        hospitalId: hospital._id,
        operationDate: { $gte: today, $lt: tomorrow }
      });

      const totalBeds = await Bed.countDocuments({ hospitalId: hospital._id });
      const occupiedBeds = await Bed.countDocuments({ 
        hospitalId: hospital._id, 
        status: 'occupied' 
      });
      const availableBeds = totalBeds - occupiedBeds;

      const pendingReferrals = await Referral.countDocuments({
        hospitalId: hospital._id,
        status: 'pending'
      });

      // Create email HTML
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stat-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .stat-title { font-size: 14px; color: #666; margin-bottom: 5px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #333; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Daily Hospital Report</h1>
              <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">
              <h2>Good Morning, ${hospital.name}!</h2>
              <p>Here's your daily summary:</p>

              <div class="stat-card">
                <div class="stat-title">📅 Today's Appointments</div>
                <div class="stat-value">${todayAppointments}</div>
              </div>

              <div class="stat-card">
                <div class="stat-title">🏥 Today's Operations</div>
                <div class="stat-value">${todayOperations}</div>
              </div>

              <div class="stat-card">
                <div class="stat-title">🛏️ Available Beds</div>
                <div class="stat-value">${availableBeds} / ${totalBeds}</div>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Occupied: ${occupiedBeds}</p>
              </div>

              <div class="stat-card">
                <div class="stat-title">📋 Pending Referrals</div>
                <div class="stat-value">${pendingReferrals}</div>
              </div>

              <p style="margin-top: 30px;">
                <strong>Have a great day!</strong><br>
                <em>CareFlow System</em>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated daily report from CareFlow</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      await sendEmail(
        hospital.email,
        `Daily Report - ${hospital.name} - ${new Date().toLocaleDateString()}`,
        emailHTML
      );
    }

    console.log('✅ Hospital Daily Reports Completed');

  } catch (error) {
    console.error('❌ Error in Hospital Daily Report:', error);
  }
};

// ==================== DOCTOR DAILY SCHEDULE ====================
const sendDoctorDailySchedule = async () => {
  try {
    console.log('📊 Starting Doctor Daily Schedules...');

    const doctors = await Doctor.find();

    for (const doctor of doctors) {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's appointments
      const todayAppointments = await Appointment.find({
        doctorId: doctor._id,
        date: { $gte: today, $lt: tomorrow }
      })
      .populate('userId', 'name phone')
      .populate('hospitalId', 'name')
      .sort('time');

      const pendingCount = await Appointment.countDocuments({
        doctorId: doctor._id,
        status: 'pending'
      });

      // Create appointments list HTML
      let appointmentsList = '';
      if (todayAppointments.length > 0) {
        appointmentsList = todayAppointments.map((apt, index) => `
          <div style="padding: 10px; background: white; margin: 10px 0; border-radius: 6px; border-left: 3px solid #4CAF50;">
            <strong>${index + 1}. ${apt.time}</strong> - ${apt.userId?.name || 'Patient'}
            <br><small style="color: #666;">Phone: ${apt.userId?.phone || 'N/A'} | Hospital: ${apt.hospitalId?.name || 'N/A'}</small>
          </div>
        `).join('');
      } else {
        appointmentsList = '<p style="color: #666; text-align: center; padding: 20px;">No appointments scheduled for today 🎉</p>';
      }

      // Create email HTML
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stat-box { display: inline-block; background: white; padding: 15px 25px; margin: 10px; border-radius: 8px; text-align: center; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👨‍⚕️ Your Daily Schedule</h1>
              <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">
              <h2>Good Morning, Dr. ${doctor.name}!</h2>

              <div style="text-align: center; margin: 20px 0;">
                <div class="stat-box">
                  <h3 style="margin: 0; color: #4CAF50;">${todayAppointments.length}</h3>
                  <p style="margin: 5px 0 0 0; color: #666;">Today's Appointments</p>
                </div>
                <div class="stat-box">
                  <h3 style="margin: 0; color: #FF9800;">${pendingCount}</h3>
                  <p style="margin: 5px 0 0 0; color: #666;">Pending Approvals</p>
                </div>
              </div>

              <h3 style="color: #333; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">📅 Today's Schedule:</h3>
              ${appointmentsList}

              <p style="margin-top: 30px;">
                <strong>Have a productive day!</strong><br>
                <em>CareFlow System</em>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated daily schedule from CareFlow</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      await sendEmail(
        doctor.email,
        `Your Schedule for ${new Date().toLocaleDateString()}`,
        emailHTML
      );
    }

    console.log('✅ Doctor Daily Schedules Completed');

  } catch (error) {
    console.error('❌ Error in Doctor Daily Schedule:', error);
  }
};

// ==================== PATIENT APPOINTMENT REMINDERS ====================
const sendPatientReminders = async () => {
  try {
    console.log('📊 Starting Patient Appointment Reminders...');

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's approved appointments
    const todayAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
      status: 'approved'
    })
    .populate('userId', 'name email')
    .populate('doctorId', 'name specialization')
    .populate('hospitalId', 'name address phone');

    for (const appointment of todayAppointments) {
      if (!appointment.userId?.email) {
        console.log(`⚠️ Skipping - No email for user: ${appointment.userId?.name}`);
        continue;
      }

      // Create email HTML
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
            .label { font-weight: bold; color: #666; display: inline-block; width: 100px; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Appointment Reminder</h1>
              <p style="font-size: 18px; margin: 10px 0;">Today's Appointment</p>
            </div>
            <div class="content">
              <h2>Hello ${appointment.userId.name}! 👋</h2>
              <p>This is a reminder about your appointment scheduled for <strong>today</strong>:</p>

              <div class="info-box">
                <p><span class="label">📅 Date:</span> ${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><span class="label">⏰ Time:</span> ${appointment.time}</p>
                <p><span class="label">👨‍⚕️ Doctor:</span> Dr. ${appointment.doctorId?.name}</p>
                <p><span class="label">🎯 Specialty:</span> ${appointment.doctorId?.specialization}</p>
                <p><span class="label">🏥 Hospital:</span> ${appointment.hospitalId?.name}</p>
                <p><span class="label">📍 Address:</span> ${appointment.hospitalId?.address}</p>
                <p><span class="label">📞 Phone:</span> ${appointment.hospitalId?.phone}</p>
              </div>

              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 6px;">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0;">
                  <li>Please arrive 15 minutes before your scheduled time</li>
                  <li>Bring any previous medical records if available</li>
                  <li>Wear a mask and maintain social distancing</li>
                </ul>
              </div>

              <p style="margin-top: 30px;">
                <strong>See you soon!</strong><br>
                <em>CareFlow System</em>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated appointment reminder from CareFlow</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email
      await sendEmail(
        appointment.userId.email,
        `Appointment Reminder - Today at ${appointment.time}`,
        emailHTML
      );
    }

    console.log(`✅ Patient Reminders Completed - Sent ${todayAppointments.length} reminders`);

  } catch (error) {
    console.error('❌ Error in Patient Reminders:', error);
  }
};

// ==================== SCHEDULE CRON JOBS ====================
const initializeCronJobs = () => {
//   console.log('🚀 Initializing Cron Jobs...');

  cron.schedule('0 10 * * *', () => {
    console.log('⏰ Running Hospital Daily Report at 10:00 AM');
    sendHospitalDailyReport();
  });

  cron.schedule('0 10 * * *', () => {
    console.log('⏰ Running Doctor Daily Schedule at 10:00 AM');
    sendDoctorDailySchedule();
  });

  cron.schedule('0 10 * * *', () => {
    console.log('⏰ Running Patient Reminders at 10:00 AM');
    sendPatientReminders();
  });
//   cron.schedule('* * * * *', () => {
//     console.log('⏰ Running Patient Reminders at 9:00 AM');
//   });

//   console.log('✅ Cron Jobs Initialized Successfully!');
//   console.log('📅 Hospital Reports: Daily at 10:00 AM');
//   console.log('📅 Doctor Schedules: Daily at 10:00 AM');
//   console.log('📅 Patient Reminders: Daily at 10:00 AM');
};

// Export functions
module.exports = {
  initializeCronJobs,
  sendHospitalDailyReport,
  sendDoctorDailySchedule,
  sendPatientReminders
};