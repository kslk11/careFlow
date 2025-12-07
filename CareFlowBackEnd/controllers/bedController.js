const Bed = require('../models/Bed');
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');

exports.createBed = async (req, res) => {
  try {
    const {
      departmentId,
      bedType,
      roomNumber,
      bedNumber,
      floor,
      pricePerDay,
      amenities,
      description
    } = req.body;

    const existingBed = await Bed.findOne({
      hospitalId: req.user.id,
      roomNumber,
      bedNumber
    });

    if (existingBed) {
      return res.status(400).json({ 
        message: `Bed ${bedNumber} in Room ${roomNumber} already exists` 
      });
    }

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }
    }

    const bed = await Bed.create({
      hospitalId: req.user.id,
      departmentId: departmentId || null,
      bedType,
      roomNumber,
      bedNumber,
      floor: floor || '',
      pricePerDay,
      amenities: amenities || [],
      description: description || '',
      isAvailable: true,
      status: 'Available'
    });

    await bed.populate('departmentId', 'name');

    res.status(201).json({
      message: 'Bed created successfully',
      bed
    });
  } catch (error) {
    console.error('Error creating bed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHospitalBeds = async (req, res) => {
  try {
    const { bedType, status, isAvailable, departmentId } = req.query;

    const filter = { hospitalId: req.user.id };
    
    if (bedType) filter.bedType = bedType;
    if (status) filter.status = status;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (departmentId) filter.departmentId = departmentId;

    const beds = await Bed.find(filter)
      .populate('departmentId', 'name')
      .populate('currentPatient.userId', 'name phone email')
      .sort({ roomNumber: 1, bedNumber: 1 });

    res.status(200).json(beds);
  } catch (error) {
    console.error('Error fetching hospital beds:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getBedsByHospital = async (req, res) => {
  try {
    const { bedType, isAvailable } = req.query;

    const filter = { 
      hospitalId: req.params.hospitalId,
      status: { $ne: 'Under Maintenance' }
    };
    
    if (bedType) filter.bedType = bedType;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const beds = await Bed.find(filter)
      .populate('departmentId', 'name')
      .select('-currentPatient') 
      .sort({ pricePerDay: 1 });

    res.status(200).json(beds);
  } catch (error) {
    console.error('Error fetching beds by hospital:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAvailableBedsByType = async (req, res) => {
  try {
    const { hospitalId, bedType } = req.params;

    const beds = await Bed.find({
      hospitalId,
      bedType,
      isAvailable: true,
      status: 'Available'
    })
      .populate('departmentId', 'name')
      .select('-currentPatient')
      .sort({ pricePerDay: 1 });

    res.status(200).json(beds);
  } catch (error) {
    console.error('Error fetching available beds:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getBedById = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id)
      .populate('hospitalId', 'name address phone')
      .populate('departmentId', 'name')
      .populate('currentPatient.userId', 'name phone email');

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    res.status(200).json(bed);
  } catch (error) {
    console.error('Error fetching bed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.updateBed = async (req, res) => {
  try {
    const {
      departmentId,
      bedType,
      roomNumber,
      bedNumber,
      floor,
      pricePerDay,
      amenities,
      description,
      status
    } = req.body;

    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (roomNumber !== bed.roomNumber || bedNumber !== bed.bedNumber) {
      const existingBed = await Bed.findOne({
        hospitalId: req.user.id,
        roomNumber,
        bedNumber,
        _id: { $ne: req.params.id }
      });

      if (existingBed) {
        return res.status(400).json({ 
          message: `Bed ${bedNumber} in Room ${roomNumber} already exists` 
        });
      }
    }

    if (departmentId !== undefined) bed.departmentId = departmentId;
    if (bedType) bed.bedType = bedType;
    if (roomNumber) bed.roomNumber = roomNumber;
    if (bedNumber) bed.bedNumber = bedNumber;
    if (floor !== undefined) bed.floor = floor;
    if (pricePerDay !== undefined) bed.pricePerDay = pricePerDay;
    if (amenities) bed.amenities = amenities;
    if (description !== undefined) bed.description = description;
    if (status) bed.status = status;

    await bed.save();

    await bed.populate('departmentId', 'name');

    res.status(200).json({
      message: 'Bed updated successfully',
      bed
    });
  } catch (error) {
    console.error('Error updating bed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.assignBed = async (req, res) => {
  try {
    const { userId, patientName, referralId } = req.body;

    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!bed.isAvailable || bed.status !== 'Available') {
      return res.status(400).json({ message: 'Bed is not available' });
    }

    bed.currentPatient = {
      userId,
      patientName,
      admissionDate: new Date(),
      referralId: referralId || null
    };
    bed.isAvailable = false;
    bed.status = 'Occupied';

    await bed.save();

    await bed.populate('currentPatient.userId', 'name phone email');

    res.status(200).json({
      message: 'Bed assigned successfully',
      bed
    });
  } catch (error) {
    console.error('Error assigning bed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.releaseBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    bed.currentPatient = undefined;
    bed.isAvailable = true;
    bed.status = 'Available';

    await bed.save();

    res.status(200).json({
      message: 'Bed released successfully',
      bed
    });
  } catch (error) {
    console.error('Error releasing bed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.deleteBed = async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    if (bed.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!bed.isAvailable) {
      return res.status(400).json({ 
        message: 'Cannot delete occupied bed. Please release the bed first.' 
      });
    }

    await bed.deleteOne();

    res.status(200).json({ message: 'Bed deleted successfully' });
  } catch (error) {
    console.error('Error deleting bed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBedStats = async (req, res) => {
  try {
    const stats = await Bed.aggregate([
      { $match: { hospitalId: req.user.id } },
      {
        $group: {
          _id: '$bedType',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
          },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] }
          },
          avgPrice: { $avg: '$pricePerDay' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching bed stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};