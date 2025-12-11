const Bill = require('../models/Billmodel');
const Referral = require('../models/Refer');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');
const Refer = require('../models/Refer');


exports.createBill = async (req, res) => {
    try {
        const {
            patientName,
            patientPhone,
            patientEmail,
            patientAddress,
            referralId,
            pid,
            appointmentId,
            prescriptionId,
            assignedDoctorId,
            items,
            tax,
            discount,
            notes,
            bedDetails,
            operationDetails,
            paymentMethod,
            paymentStatus,
            // Add these
        } = req.body;

        // Validate required fields
        if (!patientName || !patientPhone) {
            return res.status(400).json({
                success: false,
                message: "Patient name and phone are required"
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one item is required"
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required"
            });
        }

        // Generate unique bill number
        const billNumber = await Bill.generateBillNumber();

        // Calculate subtotal from items
        const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const totalAmount = subtotal + (tax || 0) - (discount || 0);

        // Create bill with all required fields
        const bill = await Bill.create({
            hospitalId: req.user.hospitalId || req.user.id,  // Fix hospitalId source
            billNumber,
            patientName,
            patientPhone,
            patientEmail,
            patientAddress,
            referralId,
            appointmentId,
            prescriptionId,
            assignedDoctorId,
            items,
            subtotal,
            tax: tax || 0,
            discount: discount || 0,
            totalAmount,
            notes,
            bedDetails,
            operationDetails,
            paymentMethod,
            paymentStatus: paymentStatus || 'pending',
            // Use provided shares or calculate

        });

        // Populate the response
        const populatedBill = await Bill.findById(bill._id)
            .populate('hospitalId', 'name address phone email')
            .populate('assignedDoctorId', 'name specialization email phone')
            .populate('referralId', 'status urgency careType')
            .populate('bedDetails.bedId', 'bedType roomNumber bedNumber pricePerDay')
            .populate('operationDetails.operationId', 'operationName price duration');

        res.status(201).json({
            success: true,
            message: "Bill created successfully",
            data: populatedBill
        });

    } catch (error) {
        console.error("Error creating bill:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating bill",
            error: error.message
        });
    }
};


// ==================== CREATE BILL FROM REFERRAL ====================
/**
 * @route   POST /api/bill/create-from-referral
 * @desc    Create bill automatically from completed referral
 * @access  Private (Hospital)
 */
/**
 * @desc    Create bill from completed referral
 * @route   POST /api/bill/create-from-referral/:id
 * @access  Private (Hospital)
 */
exports.createBillFromReferral = async (req, res) => {
  try {
    const referralId = req.params.id;

    console.log('Creating bill from referral:', referralId);

    // Find the referral with all populated data
    const referral = await Referral.findById(referralId)
      .populate('hospitalId', 'name email phone address')
      .populate('doctorId', 'name specialization')
      .populate('operationId', 'name price')
      .populate('bedId', 'bedType roomNumber bedNumber pricePerDay');

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    // Check if referral is completed
    if (referral.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Referral must be completed before generating bill',
      });
    }

    // Check if bill already exists for this referral
    const existingBill = await Bill.findOne({ referralId: referralId });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'Bill already exists for this referral',
        billNumber: existingBill.billNumber,
      });
    }

    // Generate unique bill number
    const billNumber = await Bill.generateBillNumber();

    // ✅ BUILD ITEMS ARRAY - Include BOTH operation AND bed charges
    const items = [];
    console.log(existingBill)
    // 1. Add Operation Charges (if exists)
    if (referral.operationId) {
      items.push({
        itemType: 'Operation',
        itemName: referral.operationId.name || 'Surgical Operation',
        description: `Operation performed on ${new Date(referral.operationDate).toLocaleDateString()}`,
        quantity: 1,
        unitPrice: referral.operationId.price || 0,
        totalPrice: referral.operationId.price || 0,
      });
    }

    // 2. Add Bed Charges (if exists)
    if (referral.bedId && referral.assignedDate && referral.dischargeDate) {
      // Calculate days stayed
      const admissionDate = new Date(referral.assignedDate);
      const dischargeDate = new Date(referral.dischargeDate);
      const daysStayed = Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24)) || 1;
      
      const pricePerDay = referral.bedId.pricePerDay || 0;
      const totalBedCharges = pricePerDay * daysStayed;

      items.push({
        itemType: 'Bed',
        itemName: `${referral.bedId.bedType} - Room ${referral.bedId.roomNumber}`,
        description: `${daysStayed} day(s) stay from ${admissionDate.toLocaleDateString()} to ${dischargeDate.toLocaleDateString()}`,
        quantity: daysStayed,
        unitPrice: pricePerDay,
        totalPrice: totalBedCharges,
      });
    }

    // 3. Calculate subtotal from all items
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // 4. Calculate tax (5% of subtotal)
    const tax = subtotal * 0.05;

    // 5. Calculate total amount
    const totalAmount = subtotal + tax;

    // ✅ CREATE BILL WITH COMPLETE DATA
    const billData = {
      hospitalId: referral.hospitalId._id,
      
      // Patient Information
      patientName: referral.patientName,
      patientPhone: referral.patientPhone,
      patientEmail: referral.patientEmail || null,
      patientAddress: referral.patientAddress || '',
      
      // Bill Details
      billNumber: billNumber,
      referralId: referralId,
      assignedDoctorId: referral.doctorId?._id || null,
      
      // Items (Operation + Bed + any other charges)
      items: items,
      
      // Pricing
      subtotal: subtotal,
      tax: tax,
      discount: 0,
      totalAmount: totalAmount,
      
      // Payment Information
      paymentStatus: 'pending',
      amountPaid: 0,
      amountDue: totalAmount,
      
      // Bed Details (for reference)
      bedDetails: referral.bedId ? {
        bedId: referral.bedId._id,
        bedType: referral.bedId.bedType,
        roomNumber: referral.bedId.roomNumber,
        bedNumber: referral.bedId.bedNumber,
        admissionDate: referral.assignedDate,
        dischargeDate: referral.dischargeDate,
        daysStayed: Math.ceil((new Date(referral.dischargeDate) - new Date(referral.assignedDate)) / (1000 * 60 * 60 * 24)) || 1,
        bedCharges: items.find(item => item.itemType === 'Bed')?.totalPrice || 0,
      } : null,
      
      // Operation Details (for reference)
      operationDetails: referral.operationId ? {
        operationId: referral.operationId._id,
        operationName: referral.operationId.name,
        operationDate: referral.operationDate,
        operationCharges: referral.operationId.price || 0,
      } : null,
      
      // Bill Date
      billDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    // Create the bill
    const bill = await Bill.create(billData);

    // Populate bill for response
    const populatedBill = await Bill.findById(bill._id)
      .populate('hospitalId', 'name email phone address')
      .populate('assignedDoctorId', 'name specialization')
      .populate('referralId');

    console.log('✅ Bill created successfully:', bill.billNumber);
    console.log('Items in bill:', bill.items.length);
    console.log('Total amount:', bill.totalAmount);

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: populatedBill,
    });

  } catch (error) {
    console.error('❌ Error creating bill from referral:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bill',
      error: error.message,
    });
  }
};
// ==================== GET ALL HOSPITAL BILLS ====================
/**
 * @route   GET /api/bill/hospital
 * @desc    Get all bills for a hospital
 * @access  Private (Hospital)
 */

exports.getAllbills = async (req, res) => {
    console.log("req.user =", req.user);

    const billsByhospital = await Bill.find({
        hospitalId: req.user.id
    })
    return res.json(billsByhospital);
};
exports.getHospitalBills = async (req, res) => {
    try {
        const { paymentStatus, fromDate, toDate, patientPhone } = req.query;

        const query = { hospitalId: req.user.id };

        // Filter by payment status
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        // Filter by date range
        if (fromDate || toDate) {
            query.billDate = {};
            if (fromDate) query.billDate.$gte = new Date(fromDate);
            if (toDate) query.billDate.$lte = new Date(toDate);
        }

        // Filter by patient phone
        if (patientPhone) {
            query.patientPhone = patientPhone;
        }

        const bills = await Bill.find(query)
            .populate('hospitalId', 'name address phone email')
            .populate('assignedDoctorId', 'name specialization email phone')
            .populate('referralId', 'status urgency careType')
            .populate('bedDetails.bedId', 'bedType roomNumber bedNumber pricePerDay')
            .populate('operationDetails.operationId', 'operationName price duration')
            .sort({ createdAt: -1 });

        // Calculate totals
        const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const totalPaid = bills.reduce((sum, bill) => sum + bill.amountPaid, 0);
        const totalDue = bills.reduce((sum, bill) => sum + bill.amountDue, 0);

        res.status(200).json({
            success: true,
            count: bills.length,
            summary: {
                totalRevenue,
                totalPaid,
                totalDue,
            },
            data: bills
        });

    } catch (error) {
        console.error("Error fetching hospital bills:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching bills",
            error: error.message
        });
    }
};

// ==================== GET HOSPITAL INCOME STATS ====================
/**
 * @route   GET /api/bill/income-stats
 * @desc    Get detailed income statistics for hospital
 * @access  Private (Hospital)
 */
exports.getIncomeStats = async (req, res) => {
    try {
        const { year, month } = req.query;

        const query = {
            hospitalId: req.user.id,
            paymentStatus: 'paid' // Only count paid bills
        };

        // Filter by year and month if provided
        if (year) {
            const startDate = new Date(year, month ? month - 1 : 0, 1);
            const endDate = month
                ? new Date(year, month, 0)
                : new Date(year, 11, 31, 23, 59, 59);

            query.billDate = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const bills = await Bill.find(query);

        // Calculate statistics
        const totalIncome = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

        const totalBills = bills.length;

        // Monthly breakdown
        const monthlyData = {};
        bills.forEach(bill => {
            const month = new Date(bill.billDate).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    count: 0,
                    totalIncome: 0,

                };
            }
            monthlyData[month].count++;
            monthlyData[month].totalIncome += bill.totalAmount;

        });

        // Payment method breakdown
        const paymentMethods = {};
        bills.forEach(bill => {
            const method = bill.paymentMethod || 'unknown';
            if (!paymentMethods[method]) {
                paymentMethods[method] = { count: 0, amount: 0 };
            }
            paymentMethods[method].count++;
            paymentMethods[method].amount += bill.totalAmount;
        });

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalBills,
                averageBillAmount: totalBills > 0 ? totalIncome / totalBills : 0,
                monthlyBreakdown: monthlyData,
                paymentMethodBreakdown: paymentMethods
            }
        });

    } catch (error) {
        console.error("Error fetching income stats:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching income statistics",
            error: error.message
        });
    }
};

// ==================== GET SINGLE BILL ====================
/**
 * @route   GET /api/bill/:billId
 * @desc    Get single bill details
 * @access  Private
 */
exports.getBillById = async (req, res) => {
    try {
        const { billId } = req.params;

        const bill = await Bill.findById(billId)
            .populate('hospitalId', 'name address phone email')
            .populate('assignedDoctorId', 'name specialization email phone qualification')
            .populate('referralId')
            .populate('bedDetails.bedId', 'bedType roomNumber bedNumber floor pricePerDay amenities')
            .populate('operationDetails.operationId', 'operationName price duration description');

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.status(200).json({
            success: true,
            data: bill
        });

    } catch (error) {
        console.error("Error fetching bill:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching bill",
            error: error.message
        });
    }
};

// ==================== UPDATE BILL ====================
/**
 * @route   PUT /api/bill/update/:billId
 * @desc    Update bill details
 * @access  Private (Hospital)
 */
exports.updateBill = async (req, res) => {
    try {
        const { billId } = req.params;
        const updateData = req.body;

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        // Verify hospital owns this bill
        if (bill.hospitalId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this bill"
            });
        }

        // Cannot update paid bills
        if (bill.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: "Cannot update a paid bill"
            });
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                bill[key] = updateData[key];
            }
        });

        await bill.save();

        const updatedBill = await Bill.findById(billId)
            .populate('hospitalId', 'name address phone email')
            .populate('assignedDoctorId', 'name specialization email phone')
            .populate('referralId', 'status urgency careType')
            .populate('bedDetails.bedId', 'bedType roomNumber bedNumber pricePerDay')
            .populate('operationDetails.operationId', 'operationName price duration');

        res.status(200).json({
            success: true,
            message: "Bill updated successfully",
            data: updatedBill
        });

    } catch (error) {
        console.error("Error updating bill:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating bill",
            error: error.message
        });
    }
};

// ==================== RECORD PAYMENT ====================
/**
 * @route   POST /api/bill/payment/:billId
 * @desc    Record payment for a bill
 * @access  Private (Hospital)
 */
exports.recordPayment = async (req, res) => {
    try {
        const { billId } = req.params;
        console.log("billId",billId)
        const { amount, paymentMethod, transactionId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid payment amount is required"
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required"
            });
        }

        const bill = await Bill.findOne({ _id: billId });
        console.log(bill)
        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }
        console.log("Hello1", bill._id)
        console.log("Hello2", req.user.id)
        // Verify hospital owns this bill
        // if (bill._id.toString() !== req.user.id.toString()) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Not authorized to update this bill"
        //     });
        // }

        // Check if payment exceeds due amount
        if (amount > bill.amountDue) {
            return res.status(400).json({
                success: false,
                message: `Payment amount exceeds due amount of ₹${bill.amountDue}`
            });
        }

        // Record payment using model method
        await bill.recordPayment(amount, paymentMethod, transactionId);

        const updatedBill = await Bill.findById(billId)
            .populate('hospitalId', 'name address phone email')
            .populate('assignedDoctorId', 'name specialization email phone')
            .populate('referralId', 'status urgency careType');

        res.status(200).json({
            success: true,
            message: "Payment recorded successfully",
            data: updatedBill
        });

    } catch (error) {
        console.error("Error recording payment:", error);
        res.status(500).json({
            success: false,
            message: "Server error while recording payment",
            error: error.message
        });
    }
};

// ==================== DELETE BILL ====================
/**
 * @route   DELETE /api/bill/:billId
 * @desc    Delete a bill (only if not paid)
 * @access  Private (Hospital)
 */
exports.deleteBill = async (req, res) => {
    try {
        const { billId } = req.params;

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        // Verify hospital owns this bill
        if (bill.hospitalId.toString() !== req.user.hospitalId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this bill"
            });
        }

        // Cannot delete paid bills
        if (bill.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a paid bill"
            });
        }

        await Bill.findByIdAndDelete(billId);

        res.status(200).json({
            success: true,
            message: "Bill deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting bill:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting bill",
            error: error.message
        });
    }
};

// ==================== GET BILL BY NUMBER ====================
/**
 * @route   GET /api/bill/number/:billNumber
 * @desc    Get bill by bill number
 * @access  Private (Hospital)
 */
exports.getBillByNumber = async (req, res) => {
    try {
        const { billNumber } = req.params;

        const bill = await Bill.findOne({
            billNumber,
            hospitalId: req.user.hospitalId
        })
            .populate('hospitalId', 'name address phone email')
            .populate('assignedDoctorId', 'name specialization email phone')
            .populate('referralId', 'status urgency careType')
            .populate('bedDetails.bedId', 'bedType roomNumber bedNumber pricePerDay')
            .populate('operationDetails.operationId', 'operationName price duration');

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.status(200).json({
            success: true,
            data: bill
        });

    } catch (error) {
        console.error("Error fetching bill by number:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching bill",
            error: error.message
        });
    }
};

// exports.getUserBills = async(req,res)=>{
// console.log("req.user =", req.user);

//     const billsByhospital = await Bill.find({
//         hospitalId: req.user.id
//     })
//     return res.json(billsByhospital);
// }
// Get bills for logged-in user - SIMPLER VERSION
exports.getUserBills = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log("Fetching bills for user:", userId);

        // 1️⃣ FIRST: Find referrals of logged-in user
        const referrals = await Refer.find({ userId: userId }).select("_id");
        const referralIds = referrals.map(r => r._id);

        // 2️⃣ SECOND: Find bills that match those referral IDs
        const bills = await Bill.find({ referralId: { $in: referralIds } })
            .populate("hospitalId", "name address phone email")
            .populate("assignedDoctorId", "name specialization")
            .populate({
                path: "referralId",
                select: "userId status",
                populate: {
                    path: "userId",
                    select: "name email phone"
                }
            })
            .sort({ createdAt: -1 });

        console.log("Found bills:", bills.length);

        res.status(200).json(bills);

    } catch (error) {
        console.error("Error fetching user bills:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching bills",
            error: error.message
        });
    }
};

exports.getBillByIdByBody = async(req,res)=>{
    const UserId = req.user.id
    console.log(UserId)
}