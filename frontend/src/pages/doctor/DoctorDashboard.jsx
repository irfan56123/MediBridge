import { useEffect, useState } from 'react';
import { CalendarDays, Users, Clock, CheckCircle2 } from 'lucide-react';
import { dashboardApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader, EmptyState } from '@/components/common/Loading';
import Badge from '@/components/ui/Badge';

export default function DoctorDashboard() {
  usePageTitle('Doctor Dashboard');
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi.getDoctor().then((res) => setData(res.data.data));
  }, []);

  if (!data) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={data.todayAppointments.length} icon={CalendarDays} tone="brand" />
        <StatCard label="Total Patients" value={data.totalPatients} icon={Users} tone="accent" />
        <StatCard label="Pending" value={data.pendingAppointments} icon={Clock} tone="caution" />
        <StatCard label="Completed Today" value={data.completedToday} icon={CheckCircle2} tone="stable" />
      </div>

      <Card>
        <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
        <CardContent>
          {data.todayAppointments.length === 0 ? (
            <EmptyState title="No appointments today" description="Enjoy the quiet — check back once patients book in." />
          ) : (
            <div className="divide-y divide-border">
              {data.todayAppointments.map((a) => (
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
                    <span className="font-mono text-sm text-ink/60">{a.startTime}</span>
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
