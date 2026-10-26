import { useEffect, useState } from 'react';
import { Users, Stethoscope, CalendarDays, BedDouble, Wallet, FlaskConical, PillIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { dashboardApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/common/Loading';

const STATUS_COLORS = {
  pending: '#D9A404',
  confirmed: '#146C6A',
  in_progress: '#146C6A',
  completed: '#2E8B57',
  cancelled: '#C13B3B',
  no_show: '#C13B3B',
};

export default function AdminDashboard() {
  usePageTitle('Hospital Overview');
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardApi.getAdmin().then((res) => setData(res.data.data));
  }, []);

  if (!data) return <PageLoader />;

  const trendData = data.weeklyTrend.map((d) => ({ date: d._id.slice(5), appointments: d.count }));
  const statusData = data.appointmentsByStatus.map((s) => ({
    name: s._id.replace(/_/g, ' '),
    value: s.count,
    color: STATUS_COLORS[s._id] || '#8ca3a2',
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={data.totalPatients} icon={Users} tone="brand" />
        <StatCard label="Total Doctors" value={data.totalDoctors} icon={Stethoscope} tone="accent" />
        <StatCard
          label="Today's Appointments"
          value={data.todayAppointments}
          icon={CalendarDays}
          tone="caution"
          sub={`${data.totalAppointments} total`}
        />
        <StatCard
          label="Bed Occupancy"
          value={`${data.occupiedBeds}/${data.totalBeds}`}
          icon={BedDouble}
          tone="stable"
          sub={`${data.availableBeds} available`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Revenue Collected"
          value={`৳${data.totalRevenue.toLocaleString()}`}
          icon={Wallet}
          tone="stable"
          sub={`৳${data.outstandingRevenue.toLocaleString()} outstanding`}
        />
        <StatCard label="Low Stock Medicines" value={data.lowStockMedicines} icon={PillIcon} tone="critical" />
        <StatCard label="Pending Lab Tests" value={data.pendingLabTests} icon={FlaskConical} tone="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointment Trend (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#146C6A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#146C6A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E7" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#0B2E33aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#0B2E33aa' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8E7', fontSize: 13 }} />
                <Area type="monotone" dataKey="appointments" stroke="#146C6A" strokeWidth={2} fill="url(#colorAppt)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8E7', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 capitalize text-ink/60">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-medium text-ink">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
