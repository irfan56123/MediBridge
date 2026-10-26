const express = require('express');
const router = express.Router();
const { getAdminDashboard, getDoctorDashboard, getPatientDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.get('/admin', authorize(ROLES.ADMIN), getAdminDashboard);
router.get('/doctor', authorize(ROLES.DOCTOR), getDoctorDashboard);
router.get('/patient', authorize(ROLES.PATIENT), getPatientDashboard);

module.exports = router;
