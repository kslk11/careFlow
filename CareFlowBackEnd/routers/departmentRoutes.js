const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/add',protect, roleCheck('admin'), departmentController.addDepartment);
router.get('/get', departmentController.getDepartments);
router.get('/all', protect, roleCheck('admin'), departmentController.getAllDepartments);
router.put('/update/:id', protect, roleCheck('admin'), departmentController.updateDepartment);
router.delete('/delete/:id', protect, roleCheck('admin'), departmentController.deleteDepartment);

module.exports = router;