const asyncHandler = require('express-async-handler');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors (with optional department/specialization filter)
// @route   GET /api/doctors
// @access  Private
const getDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.specialization) filter.specialization = { $regex: req.query.specialization, $options: 'i' };

  const doctors = await Doctor.find(filter)
    .populate('user', 'name email phone avatar isActive')
    .populate('department', 'name');

  res.json({ success: true, count: doctors.length, data: doctors });
});

// @desc    Get single doctor profile
// @route   GET /api/doctors/:id
// @access  Private
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('department', 'name');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json({ success: true, data: doctor });
});

// @desc    Get logged-in doctor's own profile
// @route   GET /api/doctors/me/profile
// @access  Private/Doctor
const getMyDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id }).populate('department', 'name');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }
  res.json({ success: true, data: doctor });
});

// @desc    Update doctor profile (own profile, or admin editing any)
// @route   PUT /api/doctors/:id
// @access  Private/Doctor,Admin
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  // Doctors may only edit their own profile
  if (req.user.role === 'doctor' && String(doctor.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only update your own profile');
  }

  Object.assign(doctor, req.body);
  await doctor.save();
  res.json({ success: true, data: doctor });
});

// @desc    Update doctor availability schedule
// @route   PUT /api/doctors/:id/availability
// @access  Private/Doctor,Admin
const updateAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  if (req.user.role === 'doctor' && String(doctor.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only update your own availability');
  }
  doctor.availability = req.body.availability;
  if (req.body.slotDurationMinutes) doctor.slotDurationMinutes = req.body.slotDurationMinutes;
  await doctor.save();
  res.json({ success: true, data: doctor });
});

module.exports = { getDoctors, getDoctorById, getMyDoctorProfile, updateDoctor, updateAvailability };
