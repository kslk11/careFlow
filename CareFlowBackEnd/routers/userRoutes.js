const express = require('express');
const router = express.Router();
const userController= require('../controllers/userController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/register',userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/profile', protect, userController.updateUserProfile);
router.get('/getUser', protect, userController.getUser);
router.get('/mode', protect, userController.mode);

module.exports = router;