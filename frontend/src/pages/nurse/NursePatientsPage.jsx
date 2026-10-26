import { useEffect, useState } from 'react';
import { patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';

export default function NursePatientsPage() {
  usePageTitle('Patients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientApi.getAll().then((res) => { setPatients(res.data.data); setLoading(false); });
  }, []);

  return (
    <Card>
      <CardContent className="pt-4">
        <DataTable
          loading={loading}
          data={patients}
          emptyTitle="No patients found"
          columns={[
            { key: 'reg', label: 'Reg. No.', render: (p) => <span className="font-mono text-xs">{p.registrationNumber}</span> },
            { key: 'name', label: 'Name', render: (p) => p.user?.name },
            { key: 'bloodGroup', label: 'Blood Group', render: (p) => <Badge variant="accent">{p.bloodGroup}</Badge> },
            { key: 'admitted', label: 'Status', render: (p) => <Badge variant={p.isAdmitted ? 'caution' : 'stable'}>{p.isAdmitted ? 'Admitted' : 'Outpatient'}</Badge> },
            { key: 'allergies', label: 'Allergies', render: (p) => p.allergies?.join(', ') || '—' },
          ]}
        />
      </CardContent>
    </Card>
  );
}
