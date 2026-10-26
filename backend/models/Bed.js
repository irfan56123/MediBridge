const mongoose = require('mongoose');
const { BED_STATUS } = require('../utils/constants');

const bedSchema = new mongoose.Schema(
  {
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    bedNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BED_STATUS),
      default: BED_STATUS.AVAILABLE,
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    admittedAt: Date,
    expectedDischargeDate: Date,
  },
  { timestamps: true }
);

bedSchema.index({ ward: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
