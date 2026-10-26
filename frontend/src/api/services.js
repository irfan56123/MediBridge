import api from './axios';

// ---------- Auth ----------
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ---------- Users (admin) ----------
export const userApi = {
  create: (data) => api.post('/users', data),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleActive: (id) => api.put(`/users/${id}/toggle-active`),
  updateMyProfile: (data) => api.put('/users/profile', data),
};

// ---------- Departments ----------
export const departmentApi = {
  create: (data) => api.post('/departments', data),
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  update: (id, data) => api.put(`/departments/${id}`, data),
  remove: (id) => api.delete(`/departments/${id}`),
};

// ---------- Doctors ----------
export const doctorApi = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getMyProfile: () => api.get('/doctors/me/profile'),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  updateAvailability: (id, data) => api.put(`/doctors/${id}/availability`, data),
};

// ---------- Patients ----------
export const patientApi = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getMyProfile: () => api.get('/patients/me/profile'),
  update: (id, data) => api.put(`/patients/${id}`, data),
  assignDoctor: (id, doctorId) => api.put(`/patients/${id}/assign-doctor`, { doctorId }),
};

// ---------- Appointments ----------
export const appointmentApi = {
  getAvailableSlots: (doctorId, date) => api.get('/appointments/available-slots', { params: { doctorId, date } }),
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status, notes) => api.put(`/appointments/${id}/status`, { status, notes }),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
};

// ---------- Medical Records ----------
export const medicalRecordApi = {
  create: (data) => api.post('/medical-records', data),
  getPatientHistory: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  getById: (id) => api.get(`/medical-records/${id}`),
  update: (id, data) => api.put(`/medical-records/${id}`, data),
};

// ---------- Prescriptions ----------
export const prescriptionApi = {
  create: (data) => api.post('/prescriptions', data),
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  dispense: (id) => api.put(`/prescriptions/${id}/dispense`),
};

// ---------- Pharmacy ----------
export const pharmacyApi = {
  createMedicine: (data) => api.post('/pharmacy/medicines', data),
  getMedicines: (params) => api.get('/pharmacy/medicines', { params }),
  getMedicineById: (id) => api.get(`/pharmacy/medicines/${id}`),
  updateMedicine: (id, data) => api.put(`/pharmacy/medicines/${id}`, data),
  restock: (id, quantity) => api.put(`/pharmacy/medicines/${id}/restock`, { quantity }),
  deleteMedicine: (id) => api.delete(`/pharmacy/medicines/${id}`),
};

// ---------- Lab ----------
export const labApi = {
  create: (data) => api.post('/lab', data),
  getAll: (params) => api.get('/lab', { params }),
  getById: (id) => api.get(`/lab/${id}`),
  updateStatus: (id, status) => api.put(`/lab/${id}/status`, { status }),
  submitResults: (id, data) => api.put(`/lab/${id}/results`, data),
};

// ---------- Wards / Beds ----------
export const wardApi = {
  create: (data) => api.post('/wards', data),
  getAll: () => api.get('/wards'),
  addBeds: (id, bedNumbers) => api.post(`/wards/${id}/beds`, { bedNumbers }),
  getBeds: (params) => api.get('/wards/beds/all', { params }),
  admitPatient: (bedId, data) => api.put(`/wards/beds/${bedId}/admit`, data),
  dischargePatient: (bedId) => api.put(`/wards/beds/${bedId}/discharge`),
};

// ---------- Billing ----------
export const billingApi = {
  create: (data) => api.post('/billing', data),
  getAll: (params) => api.get('/billing', { params }),
  getById: (id) => api.get(`/billing/${id}`),
  recordPayment: (id, data) => api.post(`/billing/${id}/pay`, data),
  getSummary: () => api.get('/billing/stats/summary'),
};

// ---------- Dashboard ----------
export const dashboardApi = {
  getAdmin: () => api.get('/dashboard/admin'),
  getDoctor: () => api.get('/dashboard/doctor'),
  getPatient: () => api.get('/dashboard/patient'),
};
