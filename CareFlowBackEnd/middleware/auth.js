const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.role === 'admin' || decoded.role === 'user') {
        req.user = await User.findById(decoded.id).select('-password');
      } else if (decoded.role === 'hospital') {
        req.user = await Hospital.findById(decoded.id).select('-password');
      } else if (decoded.role === 'doctor') {
        req.user = await Doctor.findById(decoded.id).select('-password');
      }
      console.log("first")
      req.userRole = decoded.role;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;