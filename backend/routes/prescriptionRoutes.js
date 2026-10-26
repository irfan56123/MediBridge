const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  dispensePrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.post('/', authorize(ROLES.DOCTOR), createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.put('/:id/dispense', authorize(ROLES.PHARMACIST), dispensePrescription);

module.exports = router;
