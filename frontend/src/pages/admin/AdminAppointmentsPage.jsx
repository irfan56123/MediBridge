import { useEffect, useState } from 'react';
import { appointmentApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

export default function AdminAppointmentsPage() {
  usePageTitle('All Appointments');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    appointmentApi.getAll(status ? { status } : {}).then((res) => {
      setAppointments(res.data.data);
      setLoading(false);
    });
  }, [status]);

  return (
    <div className="space-y-4">
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-52">
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
      </Select>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={appointments}
            emptyTitle="No appointments found"
            columns={[
              { key: 'date', label: 'Date', render: (a) => format(new Date(a.date), 'MMM d, yyyy') },
              { key: 'time', label: 'Time', render: (a) => a.startTime },
              { key: 'patient', label: 'Patient', render: (a) => a.patient?.user?.name },
              { key: 'doctor', label: 'Doctor', render: (a) => `Dr. ${a.doctor?.user?.name}` },
              { key: 'department', label: 'Department', render: (a) => a.department?.name || '—' },
              { key: 'status', label: 'Status', render: (a) => <Badge status={a.status} /> },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
