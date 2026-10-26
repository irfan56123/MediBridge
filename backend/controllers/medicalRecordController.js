const asyncHandler = require('express-async-handler');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Create a medical record (doctor visit note)
// @route   POST /api/medical-records
// @access  Private/Doctor
const createMedicalRecord = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    res.status(403);
    throw new Error('Only doctors can create medical records');
  }

  const record = await MedicalRecord.create({ ...req.body, doctor: doctor._id });
  res.status(201).json({ success: true, data: record });
});

// @desc    Get medical records for a patient (full history timeline)
// @route   GET /api/medical-records/patient/:patientId
// @access  Private
const getPatientHistory = asyncHandler(async (req, res) => {
  // Patients may only view their own history
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    if (String(patient._id) !== req.params.patientId) {
      res.status(403);
      throw new Error('You can only view your own medical history');
    }
  }

  const records = await MedicalRecord.find({ patient: req.params.patientId })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .sort('-visitDate');

  res.json({ success: true, count: records.length, data: records });
});

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
const getMedicalRecordById = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .populate({ path: 'patient', populate: { path: 'user', select: 'name' } });
  if (!record) {
    res.status(404);
    throw new Error('Medical record not found');
  }
  res.json({ success: true, data: record });
});

// @desc    Update a medical record
// @route   PUT /api/medical-records/:id
// @access  Private/Doctor
const updateMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Medical record not found');
  }
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor || String(record.doctor) !== String(doctor._id)) {
    res.status(403);
    throw new Error('You can only edit records you created');
  }
  Object.assign(record, req.body);
  await record.save();
  res.json({ success: true, data: record });
});

module.exports = { createMedicalRecord, getPatientHistory, getMedicalRecordById, updateMedicalRecord };
