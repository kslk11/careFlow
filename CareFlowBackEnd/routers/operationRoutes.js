const express = require('express');
const router = express.Router();
const {
  createOperation,
  getHospitalOperations,
  getOperationsByHospital,
  getOperationById,
  updateOperation,
  deleteOperation,
  getOperationsByDepartment
} = require('../controllers/operationController');

const protect= require('../middleware/auth');

router.post('/create', protect, createOperation);
router.get('/hospital', protect, getHospitalOperations);
router.put('/update/:id', protect, updateOperation);
router.delete('/:id', protect, deleteOperation);

router.get('/by-hospital/:hospitalId', getOperationsByHospital);
router.get('/department/:departmentId', getOperationsByDepartment);
router.get('/:id', getOperationById);

module.exports = router;