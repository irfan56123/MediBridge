import { useEffect, useState } from 'react';
import { prescriptionApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

export default function PatientPrescriptionsPage() {
  usePageTitle('My Prescriptions');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { prescriptionApi.getAll().then((res) => { setPrescriptions(res.data.data); setLoading(false); }); }, []);

  return (
    <Card>
      <CardContent className="pt-4">
        <DataTable
          loading={loading}
          data={prescriptions}
          emptyTitle="No prescriptions yet"
          columns={[
            { key: 'doctor', label: 'Doctor', render: (p) => `Dr. ${p.doctor?.user?.name}` },
            { key: 'medicines', label: 'Medicines', render: (p) => p.medicines.map((m) => `${m.medicineName} — ${m.dosage}, ${m.frequency}`).join('; ') },
            { key: 'status', label: 'Status', render: (p) => <Badge status={p.status} /> },
            { key: 'date', label: 'Date', render: (p) => format(new Date(p.createdAt), 'MMM d, yyyy') },
          ]}
        />
      </CardContent>
    </Card>
  );
}
