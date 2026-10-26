const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    temperature: Number, // Celsius
    bloodPressureSystolic: Number,
    bloodPressureDiastolic: Number,
    heartRate: Number, // bpm
    respiratoryRate: Number,
    oxygenSaturation: Number, // %
    weight: Number, // kg
    height: Number, // cm
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    chiefComplaint: String,
    symptoms: [String],
    diagnosis: [String],
    treatmentPlan: String,
    vitals: vitalsSchema,
    notes: String,
    followUpDate: Date,
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, visitDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
