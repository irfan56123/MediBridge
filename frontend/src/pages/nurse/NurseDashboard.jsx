import { useEffect, useState } from 'react';
import { BedDouble, Users, AlertCircle } from 'lucide-react';
import { wardApi, patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { PageLoader } from '@/components/common/Loading';

export default function NurseDashboard() {
  usePageTitle('Nurse Dashboard');
  const [wards, setWards] = useState(null);
  const [admitted, setAdmitted] = useState(0);

  useEffect(() => {
    wardApi.getAll().then((res) => setWards(res.data.data));
    patientApi.getAll({ isAdmitted: true }).then((res) => setAdmitted(res.data.count));
  }, []);

  if (!wards) return <PageLoader />;

  const totalBeds = wards.reduce((s, w) => s + w.totalBeds, 0);
  const occupiedBeds = wards.reduce((s, w) => s + w.occupiedBeds, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Admitted Patients" value={admitted} icon={Users} tone="brand" />
      <StatCard label="Occupied Beds" value={`${occupiedBeds}/${totalBeds}`} icon={BedDouble} tone="caution" />
      <StatCard label="Available Beds" value={totalBeds - occupiedBeds} icon={AlertCircle} tone="stable" />
    </div>
  );
}
