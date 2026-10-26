const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctor,
  updateAvailability,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.get('/me/profile', authorize(ROLES.DOCTOR), getMyDoctorProfile);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', authorize(ROLES.DOCTOR, ROLES.ADMIN), updateDoctor);
router.put('/:id/availability', authorize(ROLES.DOCTOR, ROLES.ADMIN), updateAvailability);

module.exports = router;
