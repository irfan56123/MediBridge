const express = require('express');
const router = express.Router();
const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  restockMedicine,
  deleteMedicine,
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router
  .route('/medicines')
  .post(authorize(ROLES.PHARMACIST, ROLES.ADMIN), createMedicine)
  .get(getMedicines);

router
  .route('/medicines/:id')
  .get(getMedicineById)
  .put(authorize(ROLES.PHARMACIST, ROLES.ADMIN), updateMedicine)
  .delete(authorize(ROLES.ADMIN), deleteMedicine);

router.put('/medicines/:id/restock', authorize(ROLES.PHARMACIST, ROLES.ADMIN), restockMedicine);

module.exports = router;
