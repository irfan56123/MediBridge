const express = require('express');
const router = express.Router();
const {
  createWard,
  getWards,
  addBeds,
  getBeds,
  admitPatient,
  dischargePatient,
} = require('../controllers/wardController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.route('/').post(authorize(ROLES.ADMIN), createWard).get(getWards);
router.post('/:id/beds', authorize(ROLES.ADMIN), addBeds);
router.get('/beds/all', getBeds);
router.put('/beds/:id/admit', authorize(ROLES.NURSE, ROLES.DOCTOR, ROLES.ADMIN), admitPatient);
router.put('/beds/:id/discharge', authorize(ROLES.NURSE, ROLES.DOCTOR, ROLES.ADMIN), dischargePatient);

module.exports = router;
