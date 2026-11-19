import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDays, Users, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader, EmptyState } from '@/components/common/Loading';
import Badge from '@/components/ui/Badge';

export default function DoctorDashboard() {
  usePageTitle('Doctor Dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardApi.getDoctor();
      setData(res.data.data);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not load your dashboard. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading && !data) return <PageLoader />;
  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-800">{error}</p>
        <button type="button" onClick={loadDashboard} className="mt-3 text-sm font-semibold text-red-800 underline">
          Try again
        </button>
      </div>
    );
  }

  const appointments = data.todayAppointments.length > 0
    ? data.todayAppointments
    : data.upcomingAppointments || [];
  const scheduleTitle = data.todayAppointments.length > 0 ? "Today's Schedule" : 'Upcoming Appointments';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={data.todayAppointments.length} icon={CalendarDays} tone="brand" />
        <StatCard label="Total Patients" value={data.totalPatients} icon={Users} tone="accent" />
        <StatCard label="Pending" value={data.pendingAppointments} icon={Clock} tone="caution" />
        <StatCard label="Completed Today" value={data.completedToday} icon={CheckCircle2} tone="stable" />
      </div>

      <Card>
        <CardHeader><CardTitle>{scheduleTitle}</CardTitle></CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <EmptyState
              title="No upcoming appointments"
              description="New bookings will appear here. Review your full appointment list or update your availability."
              action={<Link to="/doctor/appointments" className="text-sm font-semibold text-brand hover:underline">View appointments</Link>}
            />
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((a) => (
                <div key={a._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand-light flex items-center justify-center font-display font-semibold text-brand-dark text-sm">
                      {a.patient?.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{a.patient?.user?.name}</p>
                      <p className="text-xs text-ink/50">{a.reason || 'General consultation'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-ink/60">
                      {data.todayAppointments.length === 0 && `${format(new Date(a.date), 'MMM d')} · `}{a.startTime}
                    </span>
                    <Badge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
