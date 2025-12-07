const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'admin' });
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or passsword' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
if (!isMatch) {
  return res.status(401).json({ message: "Invalid Credentials" });
}

    const token = generateToken(user._id, 'admin');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mode:user.mode,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

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
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDetails=async(req,res)=>{
  try{
    const user = req.user._id
    const userdetails = await User.findById(user)
    // console.log(userdetails)
    res.status(200).json(userdetails)
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
}
exports.resetPassword = async(req,res)=>{
  try{
      const {id} =req.user
      const{currentPassword,newPassword} =req.body
      console.log(currentPassword,newPassword,id)
      const userdetails = await User.findById(id)
      console.log(userdetails)
      const hash  = bcrypt.hashSync(newPassword,10)
      const updatedPassword  = await User.findByIdAndUpdate(id ,{password:hash})
      res.status(200).json(updatedPassword)
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