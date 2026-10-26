import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { prescriptionApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

export default function PharmacistPrescriptionsPage() {
  usePageTitle('Prescription Queue');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    prescriptionApi.getAll().then((res) => { setPrescriptions(res.data.data); setLoading(false); });
  };
  useEffect(load, []);

  const dispense = async (id) => {
    try {
      await prescriptionApi.dispense(id);
      toast.success('Prescription dispensed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispense');
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <DataTable
          loading={loading}
          data={prescriptions}
          emptyTitle="No prescriptions"
          columns={[
            { key: 'patient', label: 'Patient', render: (p) => p.patient?.user?.name },
            { key: 'doctor', label: 'Doctor', render: (p) => `Dr. ${p.doctor?.user?.name}` },
            { key: 'medicines', label: 'Medicines', render: (p) => p.medicines.map((m) => `${m.medicineName} (${m.quantity})`).join(', ') },
            { key: 'status', label: 'Status', render: (p) => <Badge status={p.status} /> },
            { key: 'date', label: 'Date', render: (p) => format(new Date(p.createdAt), 'MMM d, yyyy') },
            { key: 'actions', label: '', render: (p) => (
              p.status === 'pending' && <Button size="sm" onClick={() => dispense(p._id)}>Dispense</Button>
            ) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
