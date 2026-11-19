const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const dateAvailabilitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD, kept as a date-only value
    available: { type: Boolean, default: true },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    specialization: {
      type: String,
      trim: true,
    },
    qualifications: [String],
    licenseNumber: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    bio: String,
    availability: [availabilitySlotSchema],
    dateAvailability: { type: [dateAvailabilitySchema], default: [] },
    dateAvailabilityConfigured: { type: Boolean, default: false },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
    rating: {
      type: Number,
      default: 0,
    },
    isAvailableForBooking: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
