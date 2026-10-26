const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Bed = require('../models/Bed');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');
const { ROLES, APPOINTMENT_STATUS, BED_STATUS, PAYMENT_STATUS } = require('../utils/constants');

// @desc    Admin overview dashboard - key metrics across the whole hospital
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, totalStaff, totalAppointments, todayAppointments] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    User.countDocuments({ role: { $ne: ROLES.PATIENT } }),
    Appointment.countDocuments(),
    Appointment.countDocuments({
      date: {
        $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setUTCHours(23, 59, 59, 999)),
      },
    }),
  ]);

  const beds = await Bed.find();
  const occupiedBeds = beds.filter((b) => b.status === BED_STATUS.OCCUPIED).length;

  const invoices = await Invoice.find();
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const outstandingRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

  const lowStockMedicines = (await Medicine.find({ isActive: true })).filter(
    (m) => m.stockQuantity <= m.reorderLevel
  ).length;

  const pendingLabTests = await LabTest.countDocuments({ status: { $in: ['requested', 'sample_collected', 'in_progress'] } });

  // Appointments by status (for a chart)
  const appointmentsByStatus = await Appointment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Last 7 days appointment trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);
  const weeklyTrend = await Appointment.aggregate([
    { $match: { date: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalPatients,
      totalDoctors,
      totalStaff,
      totalAppointments,
      todayAppointments,
      totalBeds: beds.length,
      occupiedBeds,
      availableBeds: beds.length - occupiedBeds,
      totalRevenue,
      outstandingRevenue,
      lowStockMedicines,
      pendingLabTests,
      appointmentsByStatus,
      weeklyTrend,
    },
  });
});

// @desc    Doctor's own dashboard - their patients, today's schedule
// @route   GET /api/dashboard/doctor
// @access  Private/Doctor
const getDoctorDashboard = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }

  const todayStart = new Date(new Date().setUTCHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setUTCHours(23, 59, 59, 999));

  const [todayAppointments, totalPatients, pendingAppointments, completedToday] = await Promise.all([
    Appointment.find({ doctor: doctor._id, date: { $gte: todayStart, $lte: todayEnd } })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name avatar' } })
      .sort('startTime'),
    Patient.countDocuments({ assignedDoctor: doctor._id }),
    Appointment.countDocuments({ doctor: doctor._id, status: APPOINTMENT_STATUS.PENDING }),
    Appointment.countDocuments({
      doctor: doctor._id,
      status: APPOINTMENT_STATUS.COMPLETED,
      date: { $gte: todayStart, $lte: todayEnd },
    }),
  ]);

  res.json({
    success: true,
    data: { todayAppointments, totalPatients, pendingAppointments, completedToday },
  });
});

// @desc    Patient's own dashboard - upcoming appointments, recent prescriptions
// @route   GET /api/dashboard/patient
// @access  Private/Patient
const getPatientDashboard = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const upcomingAppointments = await Appointment.find({
    patient: patient._id,
    date: { $gte: new Date() },
    status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
  })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .sort('date startTime')
    .limit(5);

  const unpaidInvoices = await Invoice.find({ patient: patient._id, paymentStatus: { $ne: PAYMENT_STATUS.PAID } });

  res.json({
    success: true,
    data: {
      upcomingAppointments,
      unpaidInvoicesCount: unpaidInvoices.length,
      totalOutstanding: unpaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0),
    },
  });
});

module.exports = { getAdminDashboard, getDoctorDashboard, getPatientDashboard };
