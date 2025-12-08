const express = require('express');
const router = express.Router();
const Billcontrollers = require('../controllers/Billcontroller');

const protect = require('../middleware/auth');

// Create a new bill manually
router.post('/create', protect, Billcontrollers.createBill);

// Create bill from completed referral (automatic)
router.post('/create-from-referral/:id', Billcontrollers.createBillFromReferral);

// Get all bills for hospital with filters
router.get('/hospital', protect, Billcontrollers.getHospitalBills);

// Get income statistics (for income dashboard)
router.get('/income-stats', protect, Billcontrollers.getIncomeStats);

// Get bill by bill number
router.get('/number/:billNumber', protect, Billcontrollers.getBillByNumber);

// Get single bill by ID
router.get('hello/:billId', Billcontrollers.getBillById);

// Update bill
router.put('/update/:billId', protect, Billcontrollers.updateBill);

// Record payment for a bill
router.post('/payment/:billId', protect, Billcontrollers.recordPayment);

// Delete bill (only unpaid bills)
router.delete('/:billId', protect, Billcontrollers.deleteBill);
router.get('/getAll/bill',protect, Billcontrollers.getAllbills)
router.get('/user', protect, Billcontrollers.getUserBills);
router.get('/userByBody', protect,Billcontrollers.getBillByIdByBody);
module.exports = router;