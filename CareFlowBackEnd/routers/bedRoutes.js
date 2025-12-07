const express = require('express');
const router = express.Router();
const {
  createBed,
  getHospitalBeds,
  getBedsByHospital,
  getAvailableBedsByType,
  getBedById,
  updateBed,
  assignBed,
  releaseBed,
  deleteBed,
  getBedStats
} = require('../controllers/bedController');

const  protect= require('../middleware/auth');

router.post('/create', protect,  createBed);
router.get('/hospital', protect,  getHospitalBeds);
router.get('/stats/hospital', protect,  getBedStats);
router.put('/update/:id', protect,  updateBed);
router.patch('/assign/:id', protect,  assignBed);
router.patch('/release/:id', protect,  releaseBed);
router.delete('/:id', protect, deleteBed);

router.get('/by-hospital/:hospitalId', getBedsByHospital);
router.get('/available/:hospitalId/:bedType', getAvailableBedsByType);
router.get('/:id', protect, getBedById);

module.exports = router;