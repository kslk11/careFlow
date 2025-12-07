const Operation = require('../models/Operation');
const Department = require('../models/Department');
const Hospital = require('../models/Hospital');


exports.createOperation = async (req, res) => {
  try {
    const { departmentId, operationName, description, price, duration } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const operation = await Operation.create({
      hospitalId: req.user.id,
      departmentId,
      operationName,
      description,
      price,
      duration
    });

    await operation.populate('departmentId', 'name description');

    res.status(201).json({
      message: 'Operation created successfully',
      operation
    });
  } catch (error) {
    console.error('Error creating operation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getHospitalOperations = async (req, res) => {
  try {
    const { departmentId } = req.query;

    const filter = { hospitalId: req.user.id };
    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const operations = await Operation.find(filter)
      .populate('departmentId', 'name description')
      .sort({ createdAt: -1 });

    res.status(200).json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getOperationsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { departmentId } = req.query;

    const filter = { hospitalId, isActive: true };
    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const operations = await Operation.find(filter)
      .populate('departmentId', 'name description')
      .sort({ operationName: 1 });

    res.status(200).json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getOperationById = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id)
      .populate('departmentId', 'name description')
      .populate('hospitalId', 'name address phone');

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    res.status(200).json(operation);
  } catch (error) {
    console.error('Error fetching operation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOperation = async (req, res) => {
  try {
    const { operationName, description, price, duration, isActive } = req.body;

    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (operation.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (operationName !== undefined) operation.operationName = operationName;
    if (description !== undefined) operation.description = description;
    if (price !== undefined) operation.price = price;
    if (duration !== undefined) operation.duration = duration;
    if (isActive !== undefined) operation.isActive = isActive;

    await operation.save();
    await operation.populate('departmentId', 'name description');

    res.status(200).json({
      message: 'Operation updated successfully',
      operation
    });
  } catch (error) {
    console.error('Error updating operation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.deleteOperation = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (operation.hospitalId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await operation.deleteOne();

    res.status(200).json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting operation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOperationsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const operations = await Operation.find({ 
      departmentId, 
      isActive: true 
    })
      .populate('hospitalId', 'name address phone')
      .sort({ operationName: 1 });

    res.status(200).json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};