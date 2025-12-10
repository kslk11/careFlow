const Refer = require('../models/Refer');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Prescription = require('../models/Prescription');
const Operation = require('../models/Operation');
const Bed = require('../models/Bed');

// @desc    Create referral from prescription
// @route   POST /api/refer/create-from-prescription
// @access  Private (Doctor only)
exports.createReferralFromPrescription = async (req, res) => {
  try {
    const {
      prescriptionId,
      hospitalId,
      operationId,
      careType,
      urgency,
      estimatedPrice,
      estimatedStayDays,
      medicalNotes
    } = req.body;

    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId', 'name phone email');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // FIXED: Use req.user.id consistently
    if (prescription.doctorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized - Not your prescription' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    let operation = null;
    if (operationId) {
      operation = await Operation.findById(operationId);
      if (!operation) {
        return res.status(404).json({ message: 'Operation not found' });
      }

      if (operation.hospitalId.toString() !== hospitalId) {
        return res.status(400).json({ message: 'Operation does not belong to selected hospital' });
      }
    }

    const referral = await Refer.create({
      referringDoctorId: req.user.id,
      hospitalId,
      userId: prescription.patientId._id,
      prescriptionId,
      operationId: operationId || null,
      patientName: prescription.patientId.name,
      patientPhone: prescription.patientId.phone,
      patientEmail: prescription.patientId.email,
      reason: `Referral for: ${prescription.diagnosis}${operation ? ` - ${operation.operationName}` : ''}`,
      medicalNotes: medicalNotes || prescription.doctorNotes || '',
      urgency: urgency || 'Medium',
      careType,
      estimatedPrice: estimatedPrice || (operation ? operation.price : 0),
      estimatedStayDays: estimatedStayDays || 0,
      status: 'pending'
    });

    await referral.populate([
      { path: 'hospitalId', select: 'name email phone address' },
      { path: 'userId', select: 'name email phone' },
      { path: 'referringDoctorId', select: 'name specialization phone' },
      { path: 'prescriptionId', select: 'diagnosis createdAt' },
      { path: 'operationId', select: 'operationName price duration departmentId' }
    ]);

    res.status(201).json({
      message: 'Referral created successfully from prescription',
      referral
    });
  } catch (error) {
    console.error('Error creating referral from prescription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all referrals made by a doctor
// @route   GET /api/refer/doctor
// @access  Private (Doctor only)

exports.getHospitalReferralsName = async(req,res)=>{
  try{
    const {id} = req.params
    const hospitalName = await Refer.findById(id).populate("hospitalId","name").populate("referringDoctorId","name").populate("userId")
    console.log(hospitalName)
    res.status(200).json(hospitalName)
  }catch (error) {
    console.error('Error fetching doctor referrals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
exports.getDoctorReferrals = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { referringDoctorId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const referrals = await Refer.find(filter)
      .populate('hospitalId', 'name email phone address')
      .populate('userId', 'name email phone')
      .populate('assignedDoctorId', 'name specialization')
      .populate('operationId', 'operationName price duration departmentId')
      .populate({
        path: 'operationId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      })
      .populate('prescriptionId', 'diagnosis createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(referrals);
  } catch (error) {
    console.error('Error fetching doctor referrals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all referrals for a hospital
// @route   GET /api/refer/hospital
// @access  Private (Hospital only)
exports.getHospitalReferrals = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { hospitalId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const referrals = await Refer.find(filter)
      .populate('referringDoctorId', 'name specialization phone email hospitalId')
      .populate({
        path: 'referringDoctorId',
        populate: {
          path: 'hospitalId',
          select: 'name address'
        }
      })
      .populate('userId', 'name email phone')
      .populate('assignedDoctorId', 'name specialization')
      .populate('operationId', 'operationName price duration departmentId')
      .populate({
        path: 'operationId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      })
      .populate('prescriptionId', 'diagnosis createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(referrals);
  } catch (error) {
    console.error('Error fetching hospital referrals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all referrals for a user/patient
// @route   GET /api/refer/user
// @access  Private (User only)
exports.getUserReferrals = async (req, res) => {
  try {
    const referrals = await Refer.find({ userId: req.user.id })
      .populate('referringDoctorId', 'name specialization phone')
      .populate('hospitalId', 'name email phone address')
      .populate('assignedDoctorId', 'name specialization phone')
      .populate('operationId', 'operationName price duration')
      .sort({ createdAt: -1 });

    res.status(200).json(referrals);
  } catch (error) {
    console.error('Error fetching user referrals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single referral by ID
// @route   GET /api/refer/:id
// @access  Private
exports.getReferralById = async (req, res) => {
  try {
    const referral = await Refer.findById(req.params.id)
      .populate('referringDoctorId', 'name specialization phone email')
      .populate('hospitalId', 'name email phone address website')
      .populate('userId', 'name email phone')
      .populate('assignedDoctorId', 'name specialization phone email')
      .populate('operationId', 'operationName price duration departmentId')
      .populate('prescriptionId', 'diagnosis medicines createdAt');

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    res.status(200).json(referral);
  } catch (error) {
    console.error('Error fetching referral:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept a referral (Hospital)
// @route   PATCH /api/refer/accept/:id
// @access  Private (Hospital only)
exports.acceptReferral = async (req, res) => {
  try {
    const { 
      appointmentDate, 
      appointmentTime, 
      assignedDoctorId, 
      hospitalResponse,
      assignedBedId
    } = req.body;

    const referral = await Refer.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    // FIXED: Use req.user.id for hospital
    if (referral.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (referral.status !== 'pending') {
      return res.status(400).json({ message: `Referral is already ${referral.status}` });
    }

    // Validate assigned doctor if provided
    if (assignedDoctorId) {
      const doctor = await Doctor.findById(assignedDoctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Assigned doctor not found' });
      }
    }

    // Validate and assign bed if provided
    if (assignedBedId) {
      const bed = await Bed.findById(assignedBedId);
      
      if (!bed) {
        return res.status(404).json({ message: 'Bed not found' });
      }

      // FIXED: Use req.user.id for hospital
      if (bed.hospitalId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Bed does not belong to your hospital' });
      }

      if (!bed.isAvailable || bed.status !== 'Available') {
        return res.status(400).json({ message: 'Selected bed is not available' });
      }

      // Assign bed to patient
      bed.currentPatient = {
        userId: referral.userId,
        patientName: referral.patientName,
        admissionDate: new Date(),
        referralId: referral._id
      };
      bed.isAvailable = false;
      bed.status = 'Occupied';
      await bed.save();

      // Update referral with bed details
      referral.icuWardDetails = {
        type: bed.bedType,
        roomNumber: bed.roomNumber,
        bedNumber: bed.bedNumber,
        assignedAt: new Date()
      };

      // Update final price to include bed charges
      const estimatedDays = referral.estimatedStayDays || 1;
      const bedCharges = bed.pricePerDay * estimatedDays;
      referral.finalPrice = (referral.estimatedPrice || 0) + bedCharges;
    }

    // Update referral
    referral.status = 'accepted';
    referral.hospitalResponse = hospitalResponse || 'Referral accepted';
    referral.appointmentDate = appointmentDate;
    referral.appointmentTime = appointmentTime;
    referral.assignedDoctorId = assignedDoctorId;

    await referral.save();

    await referral.populate([
      { path: 'hospitalId', select: 'name email phone' },
      { path: 'userId', select: 'name email phone' },
      { path: 'referringDoctorId', select: 'name specialization' },
      { path: 'assignedDoctorId', select: 'name specialization' },
      { path: 'operationId', select: 'operationName price duration' },
      { path: 'prescriptionId', select: 'diagnosis createdAt' }
    ]);

    res.status(200).json({
      message: 'Referral accepted successfully',
      referral
    });
  } catch (error) {
    console.error('Error accepting referral:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a referral (Hospital)
// @route   PATCH /api/refer/reject/:id
// @access  Private (Hospital only)
exports.rejectReferral = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const referral = await Refer.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    // FIXED: Use req.user.id
    if (referral.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (referral.status !== 'pending') {
      return res.status(400).json({ message: `Referral is already ${referral.status}` });
    }

    // Release bed if somehow pre-assigned
    if (referral.icuWardDetails && referral.icuWardDetails.type) {
      const assignedBed = await Bed.findOne({
        hospitalId: req.user.id,
        'currentPatient.referralId': referral._id
      });

      if (assignedBed) {
        assignedBed.currentPatient = undefined;
        assignedBed.isAvailable = true;
        assignedBed.status = 'Available';
        await assignedBed.save();
      }
    }

    referral.status = 'rejected';
    referral.rejectionReason = rejectionReason;
    referral.hospitalResponse = `Rejected: ${rejectionReason}`;

    await referral.save();

    await referral.populate([
      { path: 'hospitalId', select: 'name email phone' },
      { path: 'userId', select: 'name email phone' },
      { path: 'referringDoctorId', select: 'name specialization' }
    ]);

    res.status(200).json({
      message: 'Referral rejected',
      referral
    });
  } catch (error) {
    console.error('Error rejecting referral:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Complete a referral
// @route   PATCH /api/refer/complete/:id
// @access  Private (Hospital only)
exports.completeReferral = async (req, res) => {
  try {
    const referral = await Refer.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    // FIXED: Use req.user.id
    if (referral.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (referral.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted referrals can be completed' });
    }

    // Release bed if assigned
    if (referral.icuWardDetails && referral.icuWardDetails.type) {
      const assignedBed = await Bed.findOne({
        hospitalId: req.user.id,
        'currentPatient.referralId': referral._id
      });

      if (assignedBed) {
        assignedBed.currentPatient = undefined;
        assignedBed.isAvailable = true;
        assignedBed.status = 'Available';
        await assignedBed.save();
      }
    }

    referral.status = 'completed';
    await referral.save();

    res.status(200).json({
      message: 'Referral marked as completed and bed released',
      referral
    });
  } catch (error) {
    console.error('Error completing referral:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel a referral (Doctor)
// @route   PATCH /api/refer/cancel/:id
// @access  Private (Doctor only)
exports.cancelReferral = async (req, res) => {
  try {
    const referral = await Refer.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    // FIXED: Use req.user.id
    if (referral.referringDoctorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (referral.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending referrals can be cancelled' });
    }

    referral.status = 'cancelled';
    await referral.save();

    res.status(200).json({
      message: 'Referral cancelled successfully',
      referral
    });
  } catch (error) {
    console.error('Error cancelling referral:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update ICU/Ward details
// @route   PATCH /api/refer/update-icu-ward/:id
// @access  Private (Hospital only)
exports.updateIcuWardDetails = async (req, res) => {
  try {
    const {
      icuWardType,
      roomNumber,
      bedNumber,
      finalPrice,
      paymentStatus,
      amountPaid,
      paymentMethod,
      transactionId
    } = req.body;

    const referral = await Refer.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    // FIXED: Use req.user.id
    if (referral.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (icuWardType) {
      referral.icuWardDetails = {
        type: icuWardType,
        roomNumber: roomNumber || '',
        bedNumber: bedNumber || '',
        assignedAt: new Date()
      };
    }

    if (finalPrice !== undefined) {
      referral.finalPrice = finalPrice;
    }

    if (paymentStatus) {
      referral.paymentStatus = paymentStatus;
    }

    if (amountPaid !== undefined) {
      referral.paymentDetails.amountPaid = amountPaid;
      referral.paymentDetails.paymentDate = new Date();
      referral.paymentDetails.paymentMethod = paymentMethod || '';
      referral.paymentDetails.transactionId = transactionId || '';
    }

    await referral.save();

    await referral.populate([
      { path: 'hospitalId', select: 'name email phone' },
      { path: 'userId', select: 'name email phone' },
      { path: 'operationId', select: 'operationName price' }
    ]);

    res.status(200).json({
      message: 'ICU/Ward details updated successfully',
      referral
    });
  } catch (error) {
    console.error('Error updating ICU/Ward details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a referral (Doctor)
// @route   DELETE /api/refer/:id
// @access  Private (Doctor only)
exports.deleteReferral = async (req, res) => {
  try {
    const referral = await Refer.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    // FIXED: Use req.user.id
    if (referral.referringDoctorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await referral.deleteOne();

    res.status(200).json({ message: 'Referral deleted successfully' });
  } catch (error) {
    console.error('Error deleting referral:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.assignBedToReferral = async (req, res) => {
    try {
        const { referralId } = req.params;
        const {
            bedId,
            appointmentDate,
            appointmentTime,
            assignedDoctorId,
            hospitalResponse,
            totalPrice,
            bedCharges
        } = req.body;

        // Validate required fields
        if (!bedId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "Bed ID, appointment date, and time are required"
            });
        }

        // Find the referral
        const referral = await Refer.findById(referralId).populate('userId');
        console.log(referral.status)
        if (!referral) {
          return res.status(404).json({
            success: false,
            message: "Referral not found"
          });
        }
        
        // Check if referral is in accepted status
        if (referral.status !== 'accepted') {
          return res.status(400).json({
            success: false,
            message: "Referral must be in 'accepted' status to assign bed"
          });
        }
        
        // Verify the bed exists and is available
        const bed = await Bed.findById(bedId);
        
        if (!bed) {
          return res.status(404).json({
            success: false,
            message: "Bed not found"
          });
        }
        
        if (!bed.isAvailable || bed.status !== 'Available') {
          return res.status(400).json({
            success: false,
            message: "Bed is not available"
            });
          }

          // Verify bed belongs to the same hospital
          if (bed.hospitalId.toString() !== referral.hospitalId.toString()) {
            return res.status(403).json({
              success: false,
              message: "Bed does not belong to this hospital"
            });
          }
          
          // Verify doctor if provided
          if (assignedDoctorId) {
            const doctor = await Doctor.findById(assignedDoctorId);
            
            if (!doctor) {
                return res.status(404).json({
                  success: false,
                  message: "Doctor not found"
                });
              }
              
            if (doctor.hospitalId.toString() !== referral.hospitalId.toString()) {
              return res.status(403).json({
                success: false,
                    message: "Doctor does not belong to this hospital"
                  });
                }
              }
              
              // Validate appointment date is not in the past
              const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
              if (appointmentDateTime < new Date()) {
                return res.status(400).json({
                  success: false,
                  message: "Appointment date and time cannot be in the past"
            });
          }
          
          // Update the bed status to occupied
          bed.isAvailable = false;
          bed.status = 'Occupied';
          bed.currentPatient = {
            patientName: referral.patientName,
          patientPhone: referral.patientPhone,
          admissionDate: new Date(),
          referralId: referral._id
        };
        await bed.save();
        referral.status = "completed"
        
        // Update the referral with bed assignment
        referral.assignedBedId = bedId;
        referral.appointmentDate = appointmentDate;
        referral.appointmentTime = appointmentTime;
        referral.bedCharges = bedCharges || 0;
        referral.totalPrice = totalPrice || referral.estimatedPrice;
        
        if (assignedDoctorId) {
            referral.assignedDoctorId = assignedDoctorId;
        }
        
        if (hospitalResponse) {
            referral.hospitalResponse = hospitalResponse;
        }

        referral.updatedAt = new Date();
        
        await referral.save();

        // Populate the response
        const updatedReferral = await Refer.findById(referralId)
            .populate('referringDoctorId', 'name specialization email phone')
            .populate('hospitalId', 'name address phone email')
            .populate('operationId', 'operationName price duration departmentId')
            .populate('assignedDoctorId', 'name specialization email phone')
            .populate('assignedBedId', 'bedType roomNumber bedNumber floor pricePerDay');

        res.status(200).json({
            success: true,
            message: "Bed assigned successfully",
            data: updatedReferral
        });

    } catch (error) {
        console.error("Error assigning bed to referral:", error);
        res.status(500).json({
            success: false,
            message: "Server error while assigning bed",
            error: error.message
        });
    }
};