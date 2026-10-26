const express = require('express');
const router = express.Router();
const {
  createStaffUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserActive,
  updateMyProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.put('/profile', updateMyProfile);

router.route('/').post(authorize(ROLES.ADMIN), createStaffUser).get(authorize(ROLES.ADMIN), getUsers);

router
  .route('/:id')
  .get(authorize(ROLES.ADMIN), getUserById)
  .put(authorize(ROLES.ADMIN), updateUser);

router.put('/:id/toggle-active', authorize(ROLES.ADMIN), toggleUserActive);

module.exports = router;
