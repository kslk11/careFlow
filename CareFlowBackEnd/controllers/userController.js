const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, age, gender, bloodGroup } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      age,
      gender,
      bloodGroup,
      role: 'user'
    });

    const token = generateToken(user._id, 'user');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'user' });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, 'user');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.age = req.body.age || user.age;
    user.gender = req.body.gender || user.gender;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    user.medicalHistory = req.body.medicalHistory || user.medicalHistory;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      age: updatedUser.age,
      gender: updatedUser.gender,
      bloodGroup: updatedUser.bloodGroup,
      medicalHistory: updatedUser.medicalHistory,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getUser = async(req,res)=>{
  try{
    const userdetails = await User.findById(req.user._id)
    res.status(200).json(userdetails)
    console.log("helo")
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
}
exports.mode = async (req, res) => {
  try {
    const ModeDetails = await User.findById(req.user._id);

    if (!ModeDetails) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    ModeDetails.mode = ModeDetails.mode === "light" ? "dark" : "light";

    await ModeDetails.save();

    return res.status(200).json({ mode: ModeDetails.mode });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};