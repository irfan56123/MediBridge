const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "General Ward A", "ICU", "Pediatric Ward"
    },
    type: {
      type: String,
      enum: ['general', 'icu', 'private', 'pediatric', 'maternity', 'emergency'],
      default: 'general',
    },
    floor: String,
    totalBeds: {
      type: Number,
      default: 0,
    },
    chargePerDay: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ward', wardSchema);
