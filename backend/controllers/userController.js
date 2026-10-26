const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { ROLES } = require('../utils/constants');

// @desc    Admin creates a staff account (doctor, nurse, receptionist, pharmacist, lab_technician, accountant, admin)
// @route   POST /api/users
// @access  Private/Admin
const createStaffUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, gender, dateOfBirth, ...roleSpecificFields } = req.body;

  if (role === ROLES.PATIENT) {
    res.status(400);
    throw new Error('Patients should self-register via /api/auth/register');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role, phone, gender, dateOfBirth });

  // Create a linked Doctor profile automatically for doctor accounts
  if (role === ROLES.DOCTOR) {
    const doctorProfile = await Doctor.create({
      user: user._id,
      department: roleSpecificFields.department,
      specialization: roleSpecificFields.specialization,
      licenseNumber: roleSpecificFields.licenseNumber,
      consultationFee: roleSpecificFields.consultationFee,
    });
    user.profileRef = doctorProfile._id;
    await user.save();
  }

  res.status(201).json({ success: true, data: user });
});

// @desc    Get all users, optional filter by role
// @route   GET /api/users?role=doctor
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { password, ...updates } = req.body; // password changes go through change-password flow
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc    Deactivate/reactivate a user instead of hard delete (preserves medical/audit history)
// @route   PUT /api/users/:id/toggle-active
// @access  Private/Admin
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user });
});

// @desc    Update own profile (any logged-in user)
// @route   PUT /api/users/profile
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, avatar, dateOfBirth, gender } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (avatar) user.avatar = avatar;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;
  if (gender) user.gender = gender;

  await user.save();
  res.json({ success: true, data: user });
});

module.exports = {
  createStaffUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserActive,
  updateMyProfile,
};
