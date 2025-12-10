const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
      },
    });

    const info = await transporter.sendMail({
      from: '"Kaushal Kumar" <kaushalmahawer267@gmail.com>',
      to,
      subject,
      html
    });

    console.log("Email sent:", info.messageId);
    return info;

  } catch (err) {
    console.log("Email Error:", err);
  }
};

module.exports = sendEmail;
