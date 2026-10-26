// Central place for enums so the whole app stays consistent

const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'lab_technician',
  ACCOUNTANT: 'accountant',
  PATIENT: 'patient',
};

const ALL_ROLES = Object.values(ROLES);

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
};

const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  INSURANCE: 'insurance',
  MOBILE_BANKING: 'mobile_banking',
};

const LAB_TEST_STATUS = {
  REQUESTED: 'requested',
  SAMPLE_COLLECTED: 'sample_collected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const BED_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
};

const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

module.exports = {
  ROLES,
  ALL_ROLES,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  LAB_TEST_STATUS,
  BED_STATUS,
  GENDER,
};
