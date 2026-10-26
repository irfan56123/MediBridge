const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
});

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate('headOfDepartment', 'user specialization');
  res.json({ success: true, count: departments.length, data: departments });
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate('headOfDepartment');
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json({ success: true, data: department });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json({ success: true, data: department });
});

// @desc    Delete (deactivate) department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  department.isActive = false;
  await department.save();
  res.json({ success: true, message: 'Department deactivated' });
});

module.exports = { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment };
