const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const { PAYMENT_STATUS } = require('../utils/constants');

// Helper to compute totals from line items
const computeTotals = (items, discount = 0, tax = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalAmount = subtotal - discount + tax;
  return { subtotal, totalAmount };
};

// @desc    Create an invoice
// @route   POST /api/billing
// @access  Private/Accountant,Receptionist,Admin
const createInvoice = asyncHandler(async (req, res) => {
  const { patientId, items, discount, tax, dueDate, notes } = req.body;

  const itemsWithTotals = items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const { subtotal, totalAmount } = computeTotals(itemsWithTotals, discount, tax);

  const invoice = await Invoice.create({
    patient: patientId,
    items: itemsWithTotals,
    subtotal,
    discount: discount || 0,
    tax: tax || 0,
    totalAmount,
    issuedBy: req.user._id,
    dueDate,
    notes,
  });

  res.status(201).json({ success: true, data: invoice });
});

// @desc    Get invoices (patient sees own, staff sees all with filters)
// @route   GET /api/billing
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    filter.patient = patient._id;
  } else if (req.query.patientId) {
    filter.patient = req.query.patientId;
  }

  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const invoices = await Invoice.find(filter)
    .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
    .sort('-createdAt');

  res.json({ success: true, count: invoices.length, data: invoices });
});

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate({
    path: 'patient',
    populate: { path: 'user', select: 'name email phone address' },
  });
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  res.json({ success: true, data: invoice });
});

// @desc    Record a payment against an invoice
// @route   POST /api/billing/:id/pay
// @access  Private/Accountant,Receptionist,Admin
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, method, transactionRef } = req.body;
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  invoice.payments.push({ amount, method, transactionRef, receivedBy: req.user._id });
  invoice.amountPaid += Number(amount);
  invoice.paymentMethod = method;

  if (invoice.amountPaid >= invoice.totalAmount) {
    invoice.paymentStatus = PAYMENT_STATUS.PAID;
  } else if (invoice.amountPaid > 0) {
    invoice.paymentStatus = PAYMENT_STATUS.PARTIAL;
  }

  await invoice.save();
  res.json({ success: true, data: invoice });
});

// @desc    Billing summary stats (for accountant/admin dashboard)
// @route   GET /api/billing/stats/summary
// @access  Private/Accountant,Admin
const getBillingSummary = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find();
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  res.json({
    success: true,
    data: {
      totalInvoiced,
      totalRevenue,
      totalOutstanding,
      invoiceCount: invoices.length,
      paidCount: invoices.filter((i) => i.paymentStatus === PAYMENT_STATUS.PAID).length,
      unpaidCount: invoices.filter((i) => i.paymentStatus === PAYMENT_STATUS.UNPAID).length,
    },
  });
});

module.exports = { createInvoice, getInvoices, getInvoiceById, recordPayment, getBillingSummary };
