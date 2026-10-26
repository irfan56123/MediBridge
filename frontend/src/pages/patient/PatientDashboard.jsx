import { useEffect, useState } from 'react';
import { CalendarDays, Receipt } from 'lucide-react';
import { dashboardApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader, EmptyState } from '@/components/common/Loading';
import Badge from '@/components/ui/Badge';
import { format } from 'date-fns';

export default function PatientDashboard() {
  usePageTitle('My Dashboard');
  const [data, setData] = useState(null);

  useEffect(() => { dashboardApi.getPatient().then((res) => setData(res.data.data)); }, []);
  if (!data) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Upcoming Appointments" value={data.upcomingAppointments.length} icon={CalendarDays} tone="brand" />
        <StatCard label="Outstanding Balance" value={`৳${data.totalOutstanding.toLocaleString()}`} icon={Receipt} tone={data.totalOutstanding > 0 ? 'critical' : 'stable'} sub={`${data.unpaidInvoicesCount} unpaid invoice(s)`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
        <CardContent>
          {data.upcomingAppointments.length === 0 ? (
            <EmptyState title="No upcoming appointments" description="Book a visit with your doctor anytime." />
          ) : (
            <div className="divide-y divide-border">
              {data.upcomingAppointments.map((a) => (
                <div key={a._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">Dr. {a.doctor?.user?.name}</p>
                    <p className="text-xs text-ink/50">{format(new Date(a.date), 'MMM d, yyyy')} at {a.startTime}</p>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
