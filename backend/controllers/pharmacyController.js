const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');

// @desc    Add new medicine to inventory
// @route   POST /api/pharmacy/medicines
// @access  Private/Pharmacist,Admin
const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create(req.body);
  res.status(201).json({ success: true, data: medicine });
});

// @desc    Get all medicines (with search + low-stock filter)
// @route   GET /api/pharmacy/medicines
// @access  Private
const getMedicines = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { genericName: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.category) filter.category = req.query.category;

  let medicines = await Medicine.find(filter).sort('name');

  if (req.query.lowStock === 'true') {
    medicines = medicines.filter((m) => m.stockQuantity <= m.reorderLevel);
  }

  res.json({ success: true, count: medicines.length, data: medicines });
});

// @desc    Get single medicine
// @route   GET /api/pharmacy/medicines/:id
// @access  Private
const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json({ success: true, data: medicine });
});

// @desc    Update medicine (details or restock)
// @route   PUT /api/pharmacy/medicines/:id
// @access  Private/Pharmacist,Admin
const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json({ success: true, data: medicine });
});

// @desc    Restock a medicine (adds to existing quantity, keeps a clean audit-friendly action)
// @route   PUT /api/pharmacy/medicines/:id/restock
// @access  Private/Pharmacist,Admin
const restockMedicine = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  medicine.stockQuantity += Number(quantity);
  await medicine.save();
  res.json({ success: true, data: medicine });
});

// @desc    Deactivate a medicine
// @route   DELETE /api/pharmacy/medicines/:id
// @access  Private/Admin
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  medicine.isActive = false;
  await medicine.save();
  res.json({ success: true, message: 'Medicine removed from active inventory' });
});

module.exports = { createMedicine, getMedicines, getMedicineById, updateMedicine, restockMedicine, deleteMedicine };
