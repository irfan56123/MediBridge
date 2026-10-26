const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getPatientHistory,
  getMedicalRecordById,
  updateMedicalRecord,
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.post('/', authorize(ROLES.DOCTOR), createMedicalRecord);
router.get('/patient/:patientId', getPatientHistory);
router.get('/:id', getMedicalRecordById);
router.put('/:id', authorize(ROLES.DOCTOR), updateMedicalRecord);

module.exports = router;
