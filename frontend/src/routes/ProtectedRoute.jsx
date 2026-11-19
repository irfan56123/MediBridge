import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/common/Loading';

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

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return <Outlet />;
}
