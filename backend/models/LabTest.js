const mongoose = require('mongoose');
const { LAB_TEST_STATUS } = require('../utils/constants');

const labTestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    testName: {
      type: String,
      required: true, // e.g. "Complete Blood Count"
    },
    testType: {
      type: String,
      trim: true, // e.g. "Hematology", "Biochemistry"
    },
    status: {
      type: String,
      enum: Object.values(LAB_TEST_STATUS),
      default: LAB_TEST_STATUS.REQUESTED,
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine',
    },
    sampleCollectedAt: Date,
    resultCompletedAt: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // lab technician
    },
    results: [
      {
        parameter: String, // e.g. "Hemoglobin"
        value: String,
        unit: String,
        normalRange: String,
        isAbnormal: Boolean,
      },
    ],
    resultFileUrl: String, // PDF report upload
    remarks: String,
    price: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
