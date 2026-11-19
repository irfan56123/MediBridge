import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components/common/Loading';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const StaffPage = lazy(() => import('@/pages/admin/StaffPage'));
const DepartmentsPage = lazy(() => import('@/pages/admin/DepartmentsPage'));
const AdminDoctorsPage = lazy(() => import('@/pages/admin/AdminDoctorsPage'));
const AdminPatientsPage = lazy(() => import('@/pages/admin/AdminPatientsPage'));
const AdminAppointmentsPage = lazy(() => import('@/pages/admin/AdminAppointmentsPage'));
const AdminWardsPage = lazy(() => import('@/pages/admin/AdminWardsPage'));
const AdminPharmacyPage = lazy(() => import('@/pages/admin/AdminPharmacyPage'));
const AdminBillingPage = lazy(() => import('@/pages/admin/AdminBillingPage'));

const DoctorDashboard = lazy(() => import('@/pages/doctor/DoctorDashboard'));
const DoctorAppointmentsPage = lazy(() => import('@/pages/doctor/DoctorAppointmentsPage'));
const DoctorPatientsPage = lazy(() => import('@/pages/doctor/DoctorPatientsPage'));
const DoctorPrescriptionsPage = lazy(() => import('@/pages/doctor/DoctorPrescriptionsPage'));
const DoctorLabPage = lazy(() => import('@/pages/doctor/DoctorLabPage'));
const DoctorAvailabilityPage = lazy(() => import('@/pages/doctor/DoctorAvailabilityPage'));
const DoctorProfilePage = lazy(() => import('@/pages/doctor/DoctorProfilePage'));

const NurseDashboard = lazy(() => import('@/pages/nurse/NurseDashboard'));
const NurseWardsPage = lazy(() => import('@/pages/nurse/NurseWardsPage'));
const NursePatientsPage = lazy(() => import('@/pages/nurse/NursePatientsPage'));

const ReceptionistDashboard = lazy(() => import('@/pages/receptionist/ReceptionistDashboard'));
const ReceptionistAppointmentsPage = lazy(() => import('@/pages/receptionist/ReceptionistAppointmentsPage'));
const ReceptionistPatientsPage = lazy(() => import('@/pages/receptionist/ReceptionistPatientsPage'));
const ReceptionistDoctorsPage = lazy(() => import('@/pages/receptionist/ReceptionistDoctorsPage'));

const PharmacistDashboard = lazy(() => import('@/pages/pharmacist/PharmacistDashboard'));
const PharmacistInventoryPage = lazy(() => import('@/pages/pharmacist/PharmacistInventoryPage'));
const PharmacistPrescriptionsPage = lazy(() => import('@/pages/pharmacist/PharmacistPrescriptionsPage'));

const LabDashboard = lazy(() => import('@/pages/lab/LabDashboard'));
const LabTestsPage = lazy(() => import('@/pages/lab/LabTestsPage'));

const AccountantDashboard = lazy(() => import('@/pages/accountant/AccountantDashboard'));
const AccountantInvoicesPage = lazy(() => import('@/pages/accountant/AccountantInvoicesPage'));

const PatientDashboard = lazy(() => import('@/pages/patient/PatientDashboard'));
const PatientAppointmentsPage = lazy(() => import('@/pages/patient/PatientAppointmentsPage'));
const PatientHistoryPage = lazy(() => import('@/pages/patient/PatientHistoryPage'));
const PatientPrescriptionsPage = lazy(() => import('@/pages/patient/PatientPrescriptionsPage'));
const PatientLabPage = lazy(() => import('@/pages/patient/PatientLabPage'));
const PatientBillingPage = lazy(() => import('@/pages/patient/PatientBillingPage'));
const PatientDoctorsPage = lazy(() => import('@/pages/patient/PatientDoctorsPage'));

const roleHome = {
  admin: '/admin',
  doctor: '/doctor',
  nurse: '/nurse',
  receptionist: '/receptionist',
  pharmacist: '/pharmacist',
  lab_technician: '/lab',
  accountant: '/accountant',
  patient: '/patient',
};

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/staff" element={<StaffPage />} />
              <Route path="/admin/departments" element={<DepartmentsPage />} />
              <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
              <Route path="/admin/patients" element={<AdminPatientsPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
              <Route path="/admin/wards" element={<AdminWardsPage />} />
              <Route path="/admin/pharmacy" element={<AdminPharmacyPage />} />
              <Route path="/admin/billing" element={<AdminBillingPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
              <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
              <Route path="/doctor/profile" element={<DoctorProfilePage />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
              <Route path="/doctor/lab" element={<DoctorLabPage />} />
              <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['nurse']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/nurse" element={<NurseDashboard />} />
              <Route path="/nurse/wards" element={<NurseWardsPage />} />
              <Route path="/nurse/patients" element={<NursePatientsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/receptionist" element={<ReceptionistDashboard />} />
              <Route path="/receptionist/appointments" element={<ReceptionistAppointmentsPage />} />
              <Route path="/receptionist/patients" element={<ReceptionistPatientsPage />} />
              <Route path="/receptionist/doctors" element={<ReceptionistDoctorsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['pharmacist']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/pharmacist" element={<PharmacistDashboard />} />
              <Route path="/pharmacist/inventory" element={<PharmacistInventoryPage />} />
              <Route path="/pharmacist/prescriptions" element={<PharmacistPrescriptionsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['lab_technician']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/lab" element={<LabDashboard />} />
              <Route path="/lab/tests" element={<LabTestsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['accountant']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/accountant" element={<AccountantDashboard />} />
              <Route path="/accountant/invoices" element={<AccountantInvoicesPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/doctors" element={<PatientDoctorsPage />} />
              <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
              <Route path="/patient/history" element={<PatientHistoryPage />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
              <Route path="/patient/lab" element={<PatientLabPage />} />
              <Route path="/patient/billing" element={<PatientBillingPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
