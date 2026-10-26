import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components/common/Loading';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import StaffPage from '@/pages/admin/StaffPage';
import DepartmentsPage from '@/pages/admin/DepartmentsPage';
import AdminDoctorsPage from '@/pages/admin/AdminDoctorsPage';
import AdminPatientsPage from '@/pages/admin/AdminPatientsPage';
import AdminAppointmentsPage from '@/pages/admin/AdminAppointmentsPage';
import AdminWardsPage from '@/pages/admin/AdminWardsPage';
import AdminPharmacyPage from '@/pages/admin/AdminPharmacyPage';
import AdminBillingPage from '@/pages/admin/AdminBillingPage';

import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import DoctorAppointmentsPage from '@/pages/doctor/DoctorAppointmentsPage';
import DoctorPatientsPage from '@/pages/doctor/DoctorPatientsPage';
import DoctorPrescriptionsPage from '@/pages/doctor/DoctorPrescriptionsPage';
import DoctorLabPage from '@/pages/doctor/DoctorLabPage';
import DoctorAvailabilityPage from '@/pages/doctor/DoctorAvailabilityPage';

import NurseDashboard from '@/pages/nurse/NurseDashboard';
import NurseWardsPage from '@/pages/nurse/NurseWardsPage';
import NursePatientsPage from '@/pages/nurse/NursePatientsPage';

import ReceptionistDashboard from '@/pages/receptionist/ReceptionistDashboard';
import ReceptionistAppointmentsPage from '@/pages/receptionist/ReceptionistAppointmentsPage';
import ReceptionistPatientsPage from '@/pages/receptionist/ReceptionistPatientsPage';
import ReceptionistDoctorsPage from '@/pages/receptionist/ReceptionistDoctorsPage';

import PharmacistDashboard from '@/pages/pharmacist/PharmacistDashboard';
import PharmacistInventoryPage from '@/pages/pharmacist/PharmacistInventoryPage';
import PharmacistPrescriptionsPage from '@/pages/pharmacist/PharmacistPrescriptionsPage';

import LabDashboard from '@/pages/lab/LabDashboard';
import LabTestsPage from '@/pages/lab/LabTestsPage';

import AccountantDashboard from '@/pages/accountant/AccountantDashboard';
import AccountantInvoicesPage from '@/pages/accountant/AccountantInvoicesPage';

import PatientDashboard from '@/pages/patient/PatientDashboard';
import PatientAppointmentsPage from '@/pages/patient/PatientAppointmentsPage';
import PatientHistoryPage from '@/pages/patient/PatientHistoryPage';
import PatientPrescriptionsPage from '@/pages/patient/PatientPrescriptionsPage';
import PatientLabPage from '@/pages/patient/PatientLabPage';
import PatientBillingPage from '@/pages/patient/PatientBillingPage';

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
              <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
              <Route path="/patient/history" element={<PatientHistoryPage />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
              <Route path="/patient/lab" element={<PatientLabPage />} />
              <Route path="/patient/billing" element={<PatientBillingPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
