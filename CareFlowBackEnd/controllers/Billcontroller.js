const Bill = require('../models/Billmodel');
const Referral = require('../models/Refer');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');

// ==================== CREATE BILL ====================
/**
 * @route   POST /api/bill/create
 * @desc    Create a new bill
 * @access  Private (Hospital)
 */
// ==================== CREATE BILL ====================
const createBill = async (req, res) => {
    try {
        const {
            patientName,
            patientPhone,
            patientEmail,
            patientAddress,
            referralId,
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
            hospitalShare,  // Add these
            adminShare      // Add these
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
            hospitalShare: hospitalShare || (totalAmount * 0.9),
            adminShare: adminShare || (totalAmount * 0.1)
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
const createBillFromReferral = async (req, res) => {
    try {
        const { referralId } = req.body;

        if (!referralId) {
            return res.status(400).json({
                success: false,
                message: "Referral ID is required"
            });
        }

        // Find the referral
        const referral = await Referral.findById(referralId)
            .populate('operationId')
            .populate('assignedBedId')
            .populate('assignedDoctorId');

        if (!referral) {
            return res.status(404).json({
                success: false,
                message: "Referral not found"
            });
        }

        if (referral.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: "Referral must be completed to generate bill"
            });
        }

        // Check if bill already exists for this referral
        const existingBill = await Bill.findOne({ referralId: referralId });
        if (existingBill) {
            return res.status(400).json({
                success: false,
                message: "Bill already exists for this referral",
                billNumber: existingBill.billNumber
            });
        }

        // Generate bill number
        const billNumber = await Bill.generateBillNumber();

        // Build items array
        const items = [];

        // Add operation charges
        if (referral.operationId) {
            items.push({
                itemType: 'Operation',
                itemName: referral.operationId.operationName,
                description: referral.operationId.description || '',
                quantity: 1,
                unitPrice: referral.operationId.price,
                totalPrice: referral.operationId.price
            });
        }

        // Add bed charges
        if (referral.bedCharges > 0) {
            items.push({
                itemType: 'Bed',
                itemName: `${referral.assignedBedId?.bedType || 'Bed'} - Room ${referral.assignedBedId?.roomNumber || 'N/A'}`,
                description: `${referral.estimatedStayDays || 1} day(s) stay`,
                quantity: referral.estimatedStayDays || 1,
                unitPrice: referral.assignedBedId?.pricePerDay || 0,
                totalPrice: referral.bedCharges
            });
        }

        // Build bed details
        const bedDetails = referral.assignedBedId ? {
            bedId: referral.assignedBedId._id,
            bedType: referral.assignedBedId.bedType,
            roomNumber: referral.assignedBedId.roomNumber,
            bedNumber: referral.assignedBedId.bedNumber,
            daysStayed: referral.estimatedStayDays || 0,
            bedCharges: referral.bedCharges || 0
        } : undefined;

        // Build operation details
        const operationDetails = referral.operationId ? {
            operationId: referral.operationId._id,
            operationName: referral.operationId.operationName,
            operationCharges: referral.operationId.price
        } : undefined;

        // Create bill
        const bill = await Bill.create({
            hospitalId: referral.hospitalId,
            billNumber,
            patientName: referral.patientName,
            patientPhone: referral.patientPhone,
            patientEmail: referral.patientEmail,
            referralId: referral._id,
            assignedDoctorId: referral.assignedDoctorId?._id,
            items,
            subtotal: referral.totalPrice || referral.estimatedPrice,
            tax: 0,
            discount: 0,
            totalAmount: referral.totalPrice || referral.estimatedPrice,
            bedDetails,
            operationDetails,
            paymentStatus: 'pending'
        });

        const populatedBill = await Bill.findById(bill._id)
            .populate('hospitalId', 'name address phone email')
            .populate('assignedDoctorId', 'name specialization email phone')
            .populate('referralId', 'status urgency careType')
            .populate('bedDetails.bedId', 'bedType roomNumber bedNumber pricePerDay')
            .populate('operationDetails.operationId', 'operationName price duration');

        res.status(201).json({
            success: true,
            message: "Bill created from referral successfully",
            data: populatedBill
        });

    } catch (error) {
        console.error("Error creating bill from referral:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating bill from referral",
            error: error.message
        });
    }
};

// ==================== GET ALL HOSPITAL BILLS ====================
/**
 * @route   GET /api/bill/hospital
 * @desc    Get all bills for a hospital
 * @access  Private (Hospital)
 */
const getHospitalBills = async (req, res) => {
    try {
        const { paymentStatus, fromDate, toDate, patientPhone } = req.query;

        const query = { hospitalId: req.user.hospitalId };

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
        const hospitalRevenue = bills.reduce((sum, bill) => sum + bill.hospitalShare, 0);
        const adminRevenue = bills.reduce((sum, bill) => sum + bill.adminShare, 0);

        res.status(200).json({
            success: true,
            count: bills.length,
            summary: {
                totalRevenue,
                totalPaid,
                totalDue,
                hospitalShare: hospitalRevenue,
                adminShare: adminRevenue
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
const getIncomeStats = async (req, res) => {
    try {
        const { year, month } = req.query;

        const query = { 
            hospitalId: req.user.hospitalId,
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
        const hospitalShare = bills.reduce((sum, bill) => sum + bill.hospitalShare, 0);
        const adminShare = bills.reduce((sum, bill) => sum + bill.adminShare, 0);
        const totalBills = bills.length;

        // Monthly breakdown
        const monthlyData = {};
        bills.forEach(bill => {
            const month = new Date(bill.billDate).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    count: 0,
                    totalIncome: 0,
                    hospitalShare: 0,
                    adminShare: 0
                };
            }
            monthlyData[month].count++;
            monthlyData[month].totalIncome += bill.totalAmount;
            monthlyData[month].hospitalShare += bill.hospitalShare;
            monthlyData[month].adminShare += bill.adminShare;
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
                hospitalShare,
                adminShare,
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
const getBillById = async (req, res) => {
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
const updateBill = async (req, res) => {
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
        if (bill.hospitalId.toString() !== req.user.hospitalId.toString()) {
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
const recordPayment = async (req, res) => {
    try {
        const { billId } = req.params;
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
                message: "Not authorized to update this bill"
            });
        }

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
const deleteBill = async (req, res) => {
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
const getBillByNumber = async (req, res) => {
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

module.exports = {
    createBill,
    createBillFromReferral,
    getHospitalBills,
    getIncomeStats,
    getBillById,
    updateBill,
    recordPayment,
    deleteBill,
    getBillByNumber
};