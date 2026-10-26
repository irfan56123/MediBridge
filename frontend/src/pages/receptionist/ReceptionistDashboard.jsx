import { useEffect, useState } from 'react';
import { CalendarDays, UserPlus, Clock } from 'lucide-react';
import { appointmentApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { PageLoader } from '@/components/common/Loading';
import { format } from 'date-fns';

export default function ReceptionistDashboard() {
  usePageTitle('Front Desk');
  const [appointments, setAppointments] = useState(null);

  useEffect(() => {
    appointmentApi.getAll({ date: format(new Date(), 'yyyy-MM-dd') }).then((res) => setAppointments(res.data.data));
  }, []);

  if (!appointments) return <PageLoader />;

  const pending = appointments.filter((a) => a.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Today's Appointments" value={appointments.length} icon={CalendarDays} tone="brand" />
      <StatCard label="Pending Confirmation" value={pending} icon={Clock} tone="caution" />
      <StatCard label="Checked In" value={appointments.filter((a) => a.status === 'in_progress').length} icon={UserPlus} tone="stable" />
    </div>
  );
}
