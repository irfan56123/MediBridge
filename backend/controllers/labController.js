const asyncHandler = require('express-async-handler');
const LabTest = require('../models/LabTest');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { LAB_TEST_STATUS } = require('../utils/constants');

// @desc    Request a lab test
// @route   POST /api/lab
// @access  Private/Doctor
const requestLabTest = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    res.status(403);
    throw new Error('Only doctors can request lab tests');
  }
  const labTest = await LabTest.create({ ...req.body, requestedBy: doctor._id });
  res.status(201).json({ success: true, data: labTest });
});

// @desc    Get lab tests (queue view for technicians, own tests for patient/doctor)
// @route   GET /api/lab
// @access  Private
const getLabTests = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    filter.patient = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    filter.requestedBy = doctor._id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.patientId) filter.patient = req.query.patientId;

  const labTests = await LabTest.find(filter)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'requestedBy', populate: { path: 'user', select: 'name' } })
    .sort('-createdAt');

  res.json({ success: true, count: labTests.length, data: labTests });
});

// @desc    Get single lab test
// @route   GET /api/lab/:id
// @access  Private
const getLabTestById = asyncHandler(async (req, res) => {
  const labTest = await LabTest.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'requestedBy', populate: { path: 'user', select: 'name' } });
  if (!labTest) {
    res.status(404);
    throw new Error('Lab test not found');
  }
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient || String(labTest.patient._id || labTest.patient) !== String(patient._id)) {
      res.status(403);
      throw new Error('You can only view your own lab reports');
    }
  }
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || String(labTest.requestedBy._id || labTest.requestedBy) !== String(doctor._id)) {
      res.status(403);
      throw new Error('You can only view lab reports you requested');
    }
  }
  res.json({ success: true, data: labTest });
});

// @desc    Update lab test status (sample collected, in progress)
// @route   PUT /api/lab/:id/status
// @access  Private/LabTechnician
const updateLabTestStatus = asyncHandler(async (req, res) => {
  const labTest = await LabTest.findById(req.params.id);
  if (!labTest) {
    res.status(404);
    throw new Error('Lab test not found');
  }
  const allowedStatuses = [LAB_TEST_STATUS.REQUESTED, LAB_TEST_STATUS.SAMPLE_COLLECTED, LAB_TEST_STATUS.IN_PROGRESS];
  if (!allowedStatuses.includes(req.body.status)) {
    res.status(400);
    throw new Error('Use result submission to mark a lab test as completed');
  }
  labTest.status = req.body.status;
  if (req.body.status === LAB_TEST_STATUS.SAMPLE_COLLECTED) labTest.sampleCollectedAt = new Date();
  await labTest.save();
  res.json({ success: true, data: labTest });
});

// @desc    Upload lab test results
// @route   PUT /api/lab/:id/results
// @access  Private/LabTechnician
const submitLabResults = asyncHandler(async (req, res) => {
  const labTest = await LabTest.findById(req.params.id);
  if (!labTest) {
    res.status(404);
    throw new Error('Lab test not found');
  }
  labTest.results = req.body.results || labTest.results;
  if (req.body.resultFileUrl) labTest.resultFileUrl = req.body.resultFileUrl;
  if (req.body.remarks) labTest.remarks = req.body.remarks;
  labTest.status = LAB_TEST_STATUS.COMPLETED;
  labTest.performedBy = req.user._id;
  labTest.resultCompletedAt = new Date();
  await labTest.save();
  res.json({ success: true, data: labTest });
});

module.exports = { requestLabTest, getLabTests, getLabTestById, updateLabTestStatus, submitLabResults };
