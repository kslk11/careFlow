const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

// @desc    Create prescription
// @route   POST /api/prescription/create
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const doctorName = req.user.name;

    const {
      appointmentId,
      patientId,
      patientName,
      reason,
      medicines,
      dateOfVisit,
      nextVisitDate
    } = req.body;

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({ message: 'Prescription already exists for this appointment' });
    }

    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId,
      doctorName,
      patientName,
      reason,
      medicines,
      dateOfVisit: dateOfVisit || Date.now(),
      nextVisitDate
    });

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all prescriptions by doctor
// @route   GET /api/prescription/doctor
// @access  Private (Doctor)
const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const prescriptions = await Prescription.find({ doctorId })
      .sort({ createdAt: -1 })
      .populate('patientId', 'name email phone')
      .populate('appointmentId', 'date timeSlot');

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all prescriptions for a patient
// @route   GET /api/prescription/patient
// @access  Private (Patient)
const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user._id;

    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name specialization');

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get prescription by appointment
// @route   GET /api/prescription/appointment/:appointmentId
// @access  Private
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({ appointmentId });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescription/update
// @access  Private (Doctor)
const updatePrescription = async (req, res) => {
  try {
    const { appointmentId, reason, medicines, nextVisitDate } = req.body;
    const doctorId = req.user._id;

    const prescription = await Prescription.findOne({ appointmentId, doctorId });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.reason = reason || prescription.reason;
    prescription.medicines = medicines || prescription.medicines;
    prescription.nextVisitDate = nextVisitDate || prescription.nextVisitDate;

    await prescription.save();

    res.status(200).json(prescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescription/delete
// @access  Private (Doctor)
const deletePrescription = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const doctorId = req.user._id;

    const prescription = await Prescription.findOneAndDelete({ appointmentId, doctorId });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionByAppointment,
  updatePrescription,
  deletePrescription
};