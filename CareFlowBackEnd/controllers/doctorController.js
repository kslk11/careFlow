const bcrypt = require('bcrypt');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointments = require('../models/Appointment')
const generateToken = require('../utils/generateToken');

exports.registerDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      specialization, 
      qualification, 
      experience, 
      hospitalId, 
      departments, 
      consultationFee, 
      licenseNumber,
      bio,
      availableDays,
      availableTimeSlots
    } = req.body;

    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists with this email' });
    }

    const existingLicense = await Doctor.findOne({ licenseNumber });

    if (existingLicense) {
      return res.status(400).json({ message: 'License number already exists' });
    }

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    if (hospital.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot register with unapproved hospital' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      phone,
      specialization,
      qualification,
      experience,
      hospitalId,
      departments,
      consultationFee,
      licenseNumber,
      mode,
      bio: bio || "",
      availableDays: availableDays || [],
      availableTimeSlots: availableTimeSlots || { start: "", end: "" }
    });

    const token = generateToken(doctor._id, 'doctor');

    res.status(201).json({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      bio: doctor.bio,
      availableDays: doctor.availableDays,
      availableTimeSlots: doctor.availableTimeSlots,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(doctor._id, 'doctor');

    res.json({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      hospitalId:doctor.hospitalId,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorHospital = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id).populate('hospitalId');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({
      hospital: doctor.hospitalId,
      departments: doctor.departments,
      consultationFee: doctor.consultationFee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      specialization, 
      qualification, 
      experience, 
      consultationFee, 
      bio, 
      availableDays, 
      availableTimeSlots 
    } = req.body;

    const doctor = await Doctor.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (bio !== undefined) doctor.bio = bio;
    if (availableDays) doctor.availableDays = availableDays;
    if (availableTimeSlots) doctor.availableTimeSlots = availableTimeSlots;

    await doctor.save();

    res.status(200).json({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio,
      availableDays: doctor.availableDays,
      availableTimeSlots: doctor.availableTimeSlots,
      departments: doctor.departments,
      licenseNumber: doctor.licenseNumber
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const { hospital, department } = req.query;
    
    let filter = { isActive: true };

    if (hospital) {
      filter.hospitalId = hospital;
    }

    if (department) {
      filter.departments = department;
    }
    const doctors = await Doctor.find(filter)
      .populate('hospitalId', 'name address departments')

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const {id} = req.user
    const doctor = await Doctor.findById(id)
      .populate('hospitalId')
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAppointmentbyparams = async(req,res)=>{
  try{
    console.log(req.user)
    const appointments = await Appointments.find({doctorId:req.user._id})
    if(!appointments){
      return res.status(401).json("Appointment are not exist")
    }
res.status(200).json(appointments)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
exports.getDoctorByIdParams = async (req, res) => {
  try {
    const {id} = req.params
    const doctor = await Doctor.findById(id)
      .populate('hospitalId')
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.mode = async (req, res) => {
  try {
    const ModeDetails = await Doctor.findById(req.user._id);

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