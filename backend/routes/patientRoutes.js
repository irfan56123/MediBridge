const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  getMyPatientProfile,
  updatePatient,
  assignDoctor,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.get('/me/profile', authorize(ROLES.PATIENT), getMyPatientProfile);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LAB_TECHNICIAN, ROLES.ACCOUNTANT),
  getPatients
);

router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.put(
  '/:id/assign-doctor',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  assignDoctor
);

module.exports = router;
