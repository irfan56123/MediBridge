const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown',
    },
    height: Number, // cm
    weight: Number, // kg
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    insurance: {
      provider: String,
      policyNumber: String,
      validTill: Date,
    },
    // Denormalized quick-access fields
    registrationNumber: {
      type: String,
      unique: true,
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    isAdmitted: {
      type: Boolean,
      default: false,
    },
    currentBed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
    },
  },
  { timestamps: true }
);

// Generate a human-friendly registration number like PAT-000123
patientSchema.pre('save', async function (next) {
  if (this.isNew && !this.registrationNumber) {
    const count = await mongoose.model('Patient').countDocuments();
    this.registrationNumber = `PAT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
