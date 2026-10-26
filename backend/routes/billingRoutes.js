const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  recordPayment,
  getBillingSummary,
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.get('/stats/summary', authorize(ROLES.ACCOUNTANT, ROLES.ADMIN), getBillingSummary);
router.route('/').post(authorize(ROLES.ACCOUNTANT, ROLES.RECEPTIONIST, ROLES.ADMIN), createInvoice).get(getInvoices);
router.get('/:id', getInvoiceById);
router.post('/:id/pay', authorize(ROLES.ACCOUNTANT, ROLES.RECEPTIONIST, ROLES.ADMIN), recordPayment);

module.exports = router;
