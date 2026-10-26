const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
    },
    medicineName: {
      type: String,
      required: true, // stored redundantly in case medicine catalog entry is later removed
    },
    dosage: {
      type: String, // "500mg"
      required: true,
    },
    frequency: {
      type: String, // "3 times a day"
      required: true,
    },
    duration: {
      type: String, // "5 days"
      required: true,
    },
    instructions: String, // "after meals"
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
    medicines: [medicineItemSchema],
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'partially_dispensed', 'dispensed', 'cancelled'],
      default: 'pending',
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // pharmacist
    },
    dispensedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
