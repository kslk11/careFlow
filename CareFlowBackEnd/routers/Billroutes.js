// billRoutes.js - Bill Routes

const express = require('express');
const router = express.Router();
const {
    createBill,
    createBillFromReferral,
    getHospitalBills,
    getIncomeStats,
    getBillById,
    updateBill,
    recordPayment,
    deleteBill,
    getBillByNumber
} = require('../controllers/Billcontroller');

// Middleware (adjust path based on your structure)
const protect = require('../middleware/auth');

// ==================== HOSPITAL ROUTES ====================

// Create a new bill manually
router.post('/create', protect, createBill);

// Create bill from completed referral (automatic)
router.post('/create-from-referral', protect, createBillFromReferral);

// Get all bills for hospital with filters
router.get('/hospital', protect, getHospitalBills);

// Get income statistics (for income dashboard)
router.get('/income-stats', protect, getIncomeStats);

// Get bill by bill number
router.get('/number/:billNumber', protect, getBillByNumber);

// Get single bill by ID
router.get('/:billId', getBillById);

// Update bill
router.put('/update/:billId', protect, updateBill);

// Record payment for a bill
router.post('/payment/:billId', protect, recordPayment);

// Delete bill (only unpaid bills)
router.delete('/:billId', protect, deleteBill);

module.exports = router;