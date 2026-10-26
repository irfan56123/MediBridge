const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');

// @desc    Get all patients (staff use - search, list)
// @route   GET /api/patients
// @access  Private/Staff
const getPatients = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.assignedDoctor) filter.assignedDoctor = req.query.assignedDoctor;
  if (req.query.isAdmitted !== undefined) filter.isAdmitted = req.query.isAdmitted === 'true';

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  let query = Patient.find(filter).populate('user', 'name email phone avatar gender dateOfBirth');

  if (req.query.search) {
    // Search by populated user name/email requires a different approach; simplest: fetch then filter
    const all = await Patient.find(filter).populate('user', 'name email phone avatar gender dateOfBirth');
    const filtered = all.filter(
      (p) =>
        p.user &&
        (p.user.name.toLowerCase().includes(req.query.search.toLowerCase()) ||
          p.user.email.toLowerCase().includes(req.query.search.toLowerCase()) ||
          p.registrationNumber.toLowerCase().includes(req.query.search.toLowerCase()))
    );
    return res.json({ success: true, count: filtered.length, data: filtered });
  }

  const total = await Patient.countDocuments(filter);
  const patients = await query
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ success: true, count: patients.length, total, page, pages: Math.ceil(total / limit), data: patients });
});

// @desc    Get single patient full profile
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('user', 'name email phone avatar gender dateOfBirth address')
    .populate('assignedDoctor')
    .populate('currentBed');
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, data: patient });
});

// @desc    Get logged-in patient's own profile
// @route   GET /api/patients/me/profile
// @access  Private/Patient
const getMyPatientProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar gender dateOfBirth address')
    .populate({ path: 'assignedDoctor', populate: { path: 'user', select: 'name' } });
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }
  res.json({ success: true, data: patient });
});

// @desc    Update patient medical info (staff) or own info (patient)
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  if (req.user.role === 'patient' && String(patient.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only update your own profile');
  }

  // Patients can only edit limited fields; staff can edit everything
  const allowedForPatient = ['emergencyContact', 'insurance', 'allergies', 'currentMedications'];
  const updates = req.user.role === 'patient'
    ? Object.fromEntries(Object.entries(req.body).filter(([k]) => allowedForPatient.includes(k)))
    : req.body;

  Object.assign(patient, updates);
  await patient.save();
  res.json({ success: true, data: patient });
});

// @desc    Assign a doctor to a patient
// @route   PUT /api/patients/:id/assign-doctor
// @access  Private/Staff
const assignDoctor = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  patient.assignedDoctor = req.body.doctorId;
  await patient.save();
  res.json({ success: true, data: patient });
});

module.exports = { getPatients, getPatientById, getMyPatientProfile, updatePatient, assignDoctor };
