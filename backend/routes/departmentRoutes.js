const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.route('/').post(authorize(ROLES.ADMIN), createDepartment).get(getDepartments);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(authorize(ROLES.ADMIN), updateDepartment)
  .delete(authorize(ROLES.ADMIN), deleteDepartment);

module.exports = router;
