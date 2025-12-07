const User = require('../models/User')
const Hospital = require('../models/Hospital')
const Doctor = require('../models/Doctor')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/nodemailer')
exports.CombineLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = null;
    let role = null;
    let model = null;

    user = await User.findOne({ email });
    if (user) {
      role = user.role;
      model = "User";
    }
    if (!user) {
      user = await Doctor.findOne({ email });
      if (user) {
        role = "doctor";
        model = "Doctor";
      }
    }

    if (!user) {
      user = await Hospital.findOne({ email });
      if (user) {
        role = "hospital";
        model = "Hospital";
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Email not found" });
    }
    console.log(user)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: role,
        model: model,
        email: user.email,
        mode:user.mode
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
// await sendEmail({
//       to: user.email,
//       subject: "Hospital Login Successful",
//       html: `
//         <h1>Login Successful</h1>
//         <p>Your hospital has logged in successfully.</p>
//         <p>Hospital ID: ${user._id}</p>
//       `
//     });
    return res.json({
      message: "Login successful",
      token,
      role,
      model,
      userId: user._id,
      mode:user.mode,
      name:user.name
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
