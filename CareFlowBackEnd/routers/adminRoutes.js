const express = require('express');
const router = express.Router();
const adminCon = require('../controllers/adminController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/login', adminCon.loginAdmin);
router.put('/profile', protect,  adminCon.updateAdminProfile);
router.get('/Show', protect, adminCon.getDetails);
router.put('/resetPassword',protect,adminCon.resetPassword)

module.exports = router;