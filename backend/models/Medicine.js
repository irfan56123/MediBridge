const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: String,
    category: {
      type: String,
      trim: true, // e.g. "Antibiotic", "Painkiller"
    },
    manufacturer: String,
    unit: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'other'],
      default: 'tablet',
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20, // triggers a low-stock alert below this threshold
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    batchNumber: String,
    expiryDate: Date,
    supplier: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
