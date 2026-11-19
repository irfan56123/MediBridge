const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const generateToken = require('../utils/generateToken');
const { ROLES } = require('../utils/constants');

// @desc    Register a new user (public self-registration is limited to patients;
//          staff accounts are created by admin via userController)
// @route   POST /api/auth/register
// @access  Public
const registerAccount = asyncHandler(async (req, res) => {
  const { name, email, password, phone, gender, dateOfBirth, role } = req.body;
  const requestedRole = role || ROLES.PATIENT;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  if (!Object.values(ROLES).includes(requestedRole)) {
    res.status(400);
    throw new Error('Please select a valid account type');
  }
  if (requestedRole === ROLES.ADMIN) {
    res.status(403);
    throw new Error('Admin accounts can only be created by an existing administrator');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone,
    gender,
    dateOfBirth,
    role: requestedRole,
    // Every public registration must be approved by an administrator before login.
    isActive: false,
  });

  if (requestedRole === ROLES.PATIENT) {
    const patientProfile = await Patient.create({ user: user._id });
    user.profileRef = patientProfile._id;
    await user.save();
  } else if (requestedRole === ROLES.DOCTOR) {
    const doctorProfile = await Doctor.create({ user: user._id });
    user.profileRef = doctorProfile._id;
    await user.save();
  }

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    message: 'Registration received. An administrator must approve your account before you can sign in.',
  });
});

// @desc    Login for all roles
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account is pending administrator approval or has been deactivated. Contact the administrator.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc    Update own password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { registerAccount, login, getMe, changePassword };
