const bcrypt = require('bcrypt');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointments = require('../models/Appointment')
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/nodemailer')
const generatePass = () => Math.floor(10000000 + Math.random() * 90000000).toString()
exports.registerDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email,  
      phone, 
      specialization, 
      qualification, 
      experience, 
      hospitalId, 
      departments, 
      consultationFee, 
      licenseNumber,
      bio,
      mode,  // OPTIONAL
      availableDays,
      availableTimeSlots
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists with this email' });
    }

    // Check license number
    const existingLicense = await Doctor.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ message: 'License number already exists' });
    }

    // Check hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    if (hospital.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot register with unapproved hospital' });
    }

    // Generate Password
    const plainPassword = generatePass();
    console.log("Generated Password:", plainPassword);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(plainPassword, salt);

    // Create doctor
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
      mode: mode,
      bio: bio || "",
      availableDays: availableDays || [],
      availableTimeSlots: availableTimeSlots || { start: "", end: "" }
    });

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    // Email HTML template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your Account Credentials</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: auto; padding: 20px; }
            .header { background-color: #007BFF; color: white; padding: 10px; text-align: center; }
            .content { margin-top: 20px; }
            .credential { background-color: #f7f7f7; padding: 15px; border-radius: 5px; }
            .credential p { margin: 5px 0; }
            .footer { margin-top: 30px; font-size: 0.9em; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome, ${name}!</h2>
            </div>
            <div class="content">
              <p>Your doctor account has been created successfully. Below are your login credentials:</p>
              <div class="credential">
                <p><strong>User ID:</strong> ${doctor._id}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${plainPassword}</p>
              </div>
              <p>Please keep this information secure. On first login, you may change the password for better security.</p>
            </div>
            <div class="footer">
              <p>If you did not request this account, please ignore this email or contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send Email
    await sendEmail({
      to: email,
      subject: "Your Doctor Account Credentials",
      html
    });
console.log("mail Sent to: ",email)
    // Response
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
    console.log(error);
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