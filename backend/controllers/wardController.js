const asyncHandler = require('express-async-handler');
const Ward = require('../models/Ward');
const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const { BED_STATUS } = require('../utils/constants');

// @desc    Create a ward
// @route   POST /api/wards
// @access  Private/Admin
const createWard = asyncHandler(async (req, res) => {
  const ward = await Ward.create(req.body);
  res.status(201).json({ success: true, data: ward });
});

// @desc    Get all wards with bed occupancy summary
// @route   GET /api/wards
// @access  Private
const getWards = asyncHandler(async (req, res) => {
  const wards = await Ward.find();
  const wardsWithOccupancy = await Promise.all(
    wards.map(async (ward) => {
      const totalBeds = await Bed.countDocuments({ ward: ward._id });
      const occupiedBeds = await Bed.countDocuments({ ward: ward._id, status: BED_STATUS.OCCUPIED });
      return { ...ward.toObject(), totalBeds, occupiedBeds, availableBeds: totalBeds - occupiedBeds };
    })
  );
  res.json({ success: true, count: wardsWithOccupancy.length, data: wardsWithOccupancy });
});

// @desc    Add beds to a ward (bulk create)
// @route   POST /api/wards/:id/beds
// @access  Private/Admin
const addBeds = asyncHandler(async (req, res) => {
  const ward = await Ward.findById(req.params.id);
  if (!ward) {
    res.status(404);
    throw new Error('Ward not found');
  }
  const { bedNumbers } = req.body; // array like ["A1", "A2", "A3"]
  const beds = await Bed.insertMany(bedNumbers.map((bedNumber) => ({ ward: ward._id, bedNumber })));
  ward.totalBeds += beds.length;
  await ward.save();
  res.status(201).json({ success: true, data: beds });
});

// @desc    Get all beds (optionally filtered by ward/status)
// @route   GET /api/wards/beds
// @access  Private
const getBeds = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.ward) filter.ward = req.query.ward;
  if (req.query.status) filter.status = req.query.status;

  const beds = await Bed.find(filter)
    .populate('ward', 'name type chargePerDay')
    .populate({ path: 'currentPatient', populate: { path: 'user', select: 'name' } });

  res.json({ success: true, count: beds.length, data: beds });
});

// @desc    Admit a patient to a bed
// @route   PUT /api/wards/beds/:id/admit
// @access  Private/Nurse,Doctor,Admin
const admitPatient = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.id);
  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }
  if (bed.status === BED_STATUS.OCCUPIED) {
    res.status(400);
    throw new Error('This bed is already occupied');
  }

  const patient = await Patient.findById(req.body.patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  bed.status = BED_STATUS.OCCUPIED;
  bed.currentPatient = patient._id;
  bed.admittedAt = new Date();
  bed.expectedDischargeDate = req.body.expectedDischargeDate;
  await bed.save();

  patient.isAdmitted = true;
  patient.currentBed = bed._id;
  await patient.save();

  res.json({ success: true, data: bed });
});

// @desc    Discharge a patient from a bed
// @route   PUT /api/wards/beds/:id/discharge
// @access  Private/Nurse,Doctor,Admin
const dischargePatient = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.id);
  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  if (bed.currentPatient) {
    const patient = await Patient.findById(bed.currentPatient);
    if (patient) {
      patient.isAdmitted = false;
      patient.currentBed = null;
      await patient.save();
    }
  }

  bed.status = BED_STATUS.AVAILABLE;
  bed.currentPatient = null;
  bed.admittedAt = null;
  bed.expectedDischargeDate = null;
  await bed.save();

  res.json({ success: true, data: bed });
});

module.exports = { createWard, getWards, addBeds, getBeds, admitPatient, dischargePatient };
