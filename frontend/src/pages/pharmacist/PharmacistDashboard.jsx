import { useEffect, useState } from 'react';
import { Pill, AlertTriangle, FileText } from 'lucide-react';
import { pharmacyApi, prescriptionApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { PageLoader } from '@/components/common/Loading';

export default function PharmacistDashboard() {
  usePageTitle('Pharmacy Dashboard');
  const [medicines, setMedicines] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    pharmacyApi.getMedicines().then((res) => setMedicines(res.data.data));
    prescriptionApi.getAll({ status: 'pending' }).then((res) => setPending(res.data.count));
  }, []);

  if (!medicines) return <PageLoader />;
  const lowStock = medicines.filter((m) => m.stockQuantity <= m.reorderLevel).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total Medicines" value={medicines.length} icon={Pill} tone="brand" />
      <StatCard label="Low Stock Alerts" value={lowStock} icon={AlertTriangle} tone="critical" />
      <StatCard label="Pending Prescriptions" value={pending ?? 0} icon={FileText} tone="caution" />
    </div>
  );
}
