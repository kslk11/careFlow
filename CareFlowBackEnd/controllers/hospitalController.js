const bcrypt = require('bcrypt');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/nodemailer')
exports.registerHospital = async (req, res) => {
  try {
    const { name, email, password, phone, address, departments, registrationNumber, establishedYear, website } = req.body;

  
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital already exists with this email' });
    }

 
    const existingRegNumber = await Hospital.findOne({ registrationNumber });
    if (existingRegNumber) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const hospital = await Hospital.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      departments, 
      registrationNumber,
      establishedYear,
      website,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Hospital registered successfully. Waiting for admin approval.',
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        status: hospital.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await Hospital.findOne({ email });

    if (!hospital) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (hospital.status !== 'approved') {
      return res.status(403).json({ message: `Your registration is ${hospital.status}. Please contact admin.` });
    }

    const isMatch = await bcrypt.compare(password, hospital.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log("first")
    const token = generateToken(hospital._id, 'hospital');
    console.log("Hospital logged in:", hospital._id);

    res.json({
      hospital,
      token
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.hospitalDetails = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    const hospitalDetails = await Hospital.findById(hospitalId);

    if (!hospitalDetails) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    return res.status(200).json(hospitalDetails);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDoctorHospitalAs = async (req, res) => {
  try {
    const hospitalId = req.user._id; 

    const doctors = await Doctor.find({ hospitalId });

    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getDoctorHospitalParams = async (req, res) => {
  try {
    const {id} = req.params; 
    console.log("Hospital ID:", id);

    const doctors = await Doctor.find({hospitalId:id });
    console.log("Doctors:", doctors);

    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getHospitals = async (req,res)=>{
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getHospitalRequests = async (req, res) => {
  try {
    const hospitals = await Hospital.find({status:"pending"});
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.status = 'approved';
    await hospital.save();

    console.log("Hospital found:", hospital);

    await sendEmail({
      to: hospital.email, 
      subject: "Hospital Approved",
      html: `
        <h1>Your hospital has been approved</h1>
        <p>Hospital ID: ${hospital._id}</p>
      `
    });

    console.log("Email sent to:", hospital.email);

    res.json({ 
      message: 'Hospital approved successfully', 
      hospital 
    });

  } catch (error) {
    console.error("Approve hospital error:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.rejectHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.status = 'rejected';
    await hospital.save();
     await sendEmail({
      to: hospital.email, 
      subject: "Hospital Rejected",
      html: `
        <h1>Your hospital has been Rejected</h1>
        <p>Hospital ID: ${hospital._id}</p>
      `
    });

    console.log("Email sent to:", hospital.email);
    res.json({ message: 'Hospital rejected successfully', hospital });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.isActive = false;
    await hospital.save();
     await sendEmail({
      to: hospital.email, 
      subject: "Hospital deactivated",
      html: `
        <h1>Your hospital has been deactivated</h1>
        <p>Hospital ID: ${hospital._id}</p>
      `
    });

    console.log("Email sent to:", hospital.email);
    res.json({ message: 'Hospital deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.retrieveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.isActive = true;
    await hospital.save();
     await sendEmail({
      to: hospital.email, 
      subject: "Hospital activated",
      html: `
        <h1>Your hospital has been activated</h1>
        <p>Hospital ID: ${hospital._id}</p>
      `
    });

    console.log("Email sent to:", hospital.email);
    res.json({ message: 'Hospital activated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHospitalDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.user._id, isActive: true })
      .populate('hospitalId', 'name address')
      .select('-password');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user._id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    hospital.name = req.body.name || hospital.name;
    hospital.phone = req.body.phone || hospital.phone;
    hospital.address = req.body.address || hospital.address;
    hospital.departments = req.body.departments || hospital.departments;
    hospital.website = req.body.website || hospital.website;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      hospital.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedHospital = await hospital.save();
     await sendEmail({
      to: hospital.email, 
      subject: "Hospital Approved",
      html: `
        <h1>Your hospital has been approved</h1>
        <p>Hospital ID: ${hospital._id}</p>
      `
    });

    console.log("Email sent to:", hospital.email);
    res.json({
      _id: updatedHospital._id,
      name: updatedHospital.name,
      email: updatedHospital.email,
      phone: updatedHospital.phone,
      address: updatedHospital.address,
      departments: updatedHospital.departments,
      website: updatedHospital.website
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'approved', isActive: true});
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getRejectedHospitals = async (req, res) => {
  const user = req.user
  console.log(user)
  try {
    const hospitals = await Hospital.find({ status: 'rejected', isActive: true });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getDeletedHospitals = async (req, res) => {
  const user = req.user
  console.log(user)
  try {
    const hospitals = await Hospital.find({ isActive: false });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// exports.resetPassword = async(req,res)=>{
//   try{
//     console.log(req.user)
//       // const {id} =req.user
//       // const{currentPassword,newPassword} =req.body
//       // console.log(currentPassword,newPassword,id)
//       // const userdetails = await Hospital.findById(id)
//       // console.log(userdetails)
//       // const hash  = bcrypt.hashSync(newPassword,10)
//       // const updatedPassword  = await User.findByIdAndUpdate(id ,{password:hash})
//       // res.status(200).json(updatedPassword)
//   }catch (error) {
//     res.status(500).json({ message: error.message });
//     // console.log("ewd")
//   }
// }

exports.mode = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user._id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.mode = hospital.mode === "light" ? "dark" : "light";

    await hospital.save();

    return res.status(200).json({ mode: hospital.mode });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
