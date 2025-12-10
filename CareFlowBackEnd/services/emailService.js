const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER || 'your-email@gmail.com',
      pass: process.env.PASSWORD || 'your-app-password'
    }
  });
};

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CareFlow System" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };