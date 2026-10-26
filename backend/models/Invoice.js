const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('../utils/constants');

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true, // e.g. "Consultation - Dr. Smith", "CBC Lab Test", "Paracetamol x10"
    },
    category: {
      type: String,
      enum: ['consultation', 'lab_test', 'medicine', 'ward_charge', 'procedure', 'other'],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
    },
    payments: [
      {
        amount: Number,
        method: { type: String, enum: Object.values(PAYMENT_METHOD) },
        paidAt: { type: Date, default: Date.now },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        transactionRef: String,
      },
    ],
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: Date,
    notes: String,
  },
  { timestamps: true }
);

invoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
