import { useEffect, useState } from 'react';
import { Users, Stethoscope, CalendarDays, BedDouble, Wallet, FlaskConical, PillIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { dashboardApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/common/Loading';

const STATUS_COLORS = {
  pending: '#a8740a',
  confirmed: '#087e8b',
  in_progress: '#087e8b',
  completed: '#21805b',
  cancelled: '#bd4545',
  no_show: '#bd4545',
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
                    <stop offset="5%" stopColor="#087e8b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#087e8b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" stroke="#e3eaf0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e3eaf0', boxShadow: '0 8px 24px #172b3a12', fontSize: 12 }} />
                <Area type="monotone" dataKey="appointments" stroke="#087e8b" strokeWidth={2.5} fill="url(#colorAppt)" />
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
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e3eaf0', boxShadow: '0 8px 24px #172b3a12', fontSize: 12 }} />
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
