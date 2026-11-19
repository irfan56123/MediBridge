const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const getOrCreatePatientProfile = async (user) => {
  let patient = await Patient.findOne({ user: user._id });
  if (patient) return patient;

  try {
    patient = await Patient.create({ user: user._id });
  } catch (error) {
    // A parallel request may have created the unique profile first.
    if (error.code !== 11000) throw error;
    patient = await Patient.findOne({ user: user._id });
  }
  if (patient && String(user.profileRef || '') !== String(patient._id)) {
    user.profileRef = patient._id;
    await user.save({ validateBeforeSave: false });
  }
  return patient;
};

// Helper: convert "HH:MM" to minutes since midnight
const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toTimeStr = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// @desc    Get available time slots for a doctor on a given date
// @route   GET /api/appointments/available-slots?doctorId=&date=YYYY-MM-DD
// @access  Private
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    res.status(400);
    throw new Error('doctorId and date are required');
  }

  const doctor = await Doctor.findById(doctorId);
  const doctorUser = doctor ? await User.findById(doctor.user).select('isActive') : null;
  if (!doctor || !doctorUser?.isActive || !doctor.isAvailableForBooking) {
    res.status(404);
    throw new Error('This doctor is not currently accepting appointments');
  }

  const dateOverride = doctor.dateAvailability.find((entry) => entry.date === date);
  const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySchedule = doctor.dateAvailabilityConfigured
    ? (dateOverride?.available ? [{ startTime: dateOverride.startTime, endTime: dateOverride.endTime }] : [])
    : doctor.availability.filter((slot) => slot.day === dayName);

  if (daySchedule.length === 0) {
    return res.json({ success: true, data: [] });
  }

  // Get already-booked slots for this doctor on this date (excluding cancelled)
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
  });
  const bookedStartTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const duration = doctor.slotDurationMinutes || 30;
  const allSlots = [];

  daySchedule.forEach((block) => {
    let cursor = toMinutes(block.startTime);
    const end = toMinutes(block.endTime);
    while (cursor + duration <= end) {
      const startStr = toTimeStr(cursor);
      allSlots.push({
        startTime: startStr,
        endTime: toTimeStr(cursor + duration),
        isBooked: bookedStartTimes.has(startStr),
      });
      cursor += duration;
    }
  });

  res.json({ success: true, data: allSlots.filter((s) => !s.isBooked) });
});

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, date, startTime, endTime, reason, type } = req.body;

  // Resolve patient: if a patient is booking for themselves, look up their own profile
  let patient;
  if (req.user.role === 'patient') {
    patient = await getOrCreatePatientProfile(req.user);
  } else {
    patient = await Patient.findById(patientId);
  }
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  const doctorUser = await User.findById(doctor.user).select('isActive');
  if (!doctorUser?.isActive || !doctor.isAvailableForBooking) {
    res.status(400);
    throw new Error('This doctor is not currently accepting appointments');
  }

  const dateOverride = doctor.dateAvailability.find((entry) => entry.date === date);
  const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const schedule = doctor.dateAvailabilityConfigured
    ? (dateOverride?.available ? [{ startTime: dateOverride.startTime, endTime: dateOverride.endTime }] : [])
    : doctor.availability.filter((slot) => slot.day === dayName);
  const duration = doctor.slotDurationMinutes || 30;
  const validSlot = schedule.some((block) => {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    const blockStart = toMinutes(block.startTime);
    const blockEnd = toMinutes(block.endTime);
    return start >= blockStart && end <= blockEnd && end - start === duration && (start - blockStart) % duration === 0;
  });
  if (!validSlot) {
    res.status(400);
    throw new Error('This date or time is not available for appointments');
  }

  // Conflict check: is this exact slot already booked for this doctor?
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const conflict = await Appointment.findOne({
    doctor: doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    startTime,
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
  });
  if (conflict) {
    res.status(409);
    throw new Error('This time slot has just been booked. Please choose another.');
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctorId,
    department: doctor.department,
    date,
    startTime,
    endTime,
    reason,
    type: type || 'in_person',
    bookedBy: req.user._id,
    status: APPOINTMENT_STATUS.PENDING,
  });

  res.status(201).json({ success: true, data: appointment });
});

// @desc    Get appointments (filtered by role: patients see own, doctors see own, staff see all)
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'patient') {
    const patient = await getOrCreatePatientProfile(req.user);
    filter.patient = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    filter.doctor = doctor._id;
  }

  if (req.query.doctorId) filter.doctor = req.query.doctorId;
  if (req.query.patientId) filter.patient = req.query.patientId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const start = new Date(req.query.date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(req.query.date);
    end.setUTCHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const appointments = await Appointment.find(filter)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email avatar' } })
    .populate('department', 'name')
    .sort('-date -startTime');

  res.json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email avatar' } })
    .populate('department', 'name');
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json({ success: true, data: appointment });
});

// @desc    Update appointment status (confirm, check-in, complete, no-show)
// @route   PUT /api/appointments/:id/status
// @access  Private/Staff,Doctor
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
      res.status(403);
      throw new Error('You can only update appointments assigned to you');
    }
  }

  appointment.status = status;
  if (req.user.role === 'doctor' && status === APPOINTMENT_STATUS.CONFIRMED && !appointment.meetingUrl) {
    const roomId = crypto.randomBytes(16).toString('hex');
    appointment.meetingUrl = `https://meet.jit.si/MediBridge-${roomId}`;
    appointment.meetingCreatedAt = new Date();
  }
  if (notes) appointment.notes = notes;
  if (status === APPOINTMENT_STATUS.IN_PROGRESS) appointment.checkedInAt = new Date();
  if (status === APPOINTMENT_STATUS.COMPLETED) appointment.completedAt = new Date();

  await appointment.save();
  res.json({ success: true, data: appointment });
});

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancelReason = req.body.reason || 'No reason provided';
  await appointment.save();
  res.json({ success: true, data: appointment });
});

module.exports = {
  getAvailableSlots,
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};
