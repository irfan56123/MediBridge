const express = require('express');
const router = express.Router();
const {
  requestLabTest,
  getLabTests,
  getLabTestById,
  updateLabTestStatus,
  submitLabResults,
} = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.post('/', authorize(ROLES.DOCTOR), requestLabTest);
router.get('/', getLabTests);
router.get('/:id', getLabTestById);
router.put('/:id/status', authorize(ROLES.LAB_TECHNICIAN, ROLES.ADMIN), updateLabTestStatus);
router.put('/:id/results', authorize(ROLES.LAB_TECHNICIAN, ROLES.ADMIN), submitLabResults);

module.exports = router;
