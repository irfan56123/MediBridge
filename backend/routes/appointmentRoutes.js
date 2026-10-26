const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.get('/available-slots', getAvailableSlots);
router.route('/').post(createAppointment).get(getAppointments);
router.get('/:id', getAppointmentById);
router.put(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST),
  updateAppointmentStatus
);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
