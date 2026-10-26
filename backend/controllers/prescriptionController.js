const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');

// @desc    Create a prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
const createPrescription = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    res.status(403);
    throw new Error('Only doctors can write prescriptions');
  }
  const prescription = await Prescription.create({ ...req.body, doctor: doctor._id });
  res.status(201).json({ success: true, data: prescription });
});

// @desc    Get prescriptions (patient sees own, pharmacist sees pending queue, doctor sees own written)
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    filter.patient = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    filter.doctor = doctor._id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.patientId) filter.patient = req.query.patientId;

  const prescriptions = await Prescription.find(filter)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .sort('-createdAt');

  res.json({ success: true, count: prescriptions.length, data: prescriptions });
});

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }
  res.json({ success: true, data: prescription });
});

// @desc    Dispense a prescription (pharmacist) - deducts stock from inventory
// @route   PUT /api/prescriptions/:id/dispense
// @access  Private/Pharmacist
const dispensePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }
  if (prescription.status === 'dispensed') {
    res.status(400);
    throw new Error('Prescription already dispensed');
  }

  // Deduct stock for each medicine, where a catalog link exists
  for (const item of prescription.medicines) {
    if (item.medicine) {
      const medicine = await Medicine.findById(item.medicine);
      if (medicine) {
        if (medicine.stockQuantity < item.quantity) {
          res.status(400);
          throw new Error(`Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}`);
        }
        medicine.stockQuantity -= item.quantity;
        await medicine.save();
      }
    }
  }

  prescription.status = 'dispensed';
  prescription.dispensedBy = req.user._id;
  prescription.dispensedAt = new Date();
  await prescription.save();

  res.json({ success: true, data: prescription });
});

module.exports = { createPrescription, getPrescriptions, getPrescriptionById, dispensePrescription };
