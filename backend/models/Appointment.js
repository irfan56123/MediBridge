const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const appointmentSchema = new mongoose.Schema(
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    date: {
      type: Date,
      required: true, // stores just the calendar day (midnight UTC)
    },
    startTime: {
      type: String, // "09:30"
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
    },
    type: {
      type: String,
      enum: ['in_person', 'follow_up', 'emergency'],
      default: 'in_person',
    },
    notes: String, // doctor's private notes about the appointment
    cancelReason: String,
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // could be the patient themself, or a receptionist
    },
    checkedInAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// Prevent double-booking the same doctor at the same date/time
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: false });

module.exports = mongoose.model('Appointment', appointmentSchema);
