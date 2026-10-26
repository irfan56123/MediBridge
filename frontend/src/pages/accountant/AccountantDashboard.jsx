import { useEffect, useState } from 'react';
import { Wallet, AlertTriangle, Receipt } from 'lucide-react';
import { billingApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { PageLoader } from '@/components/common/Loading';

export default function AccountantDashboard() {
  usePageTitle('Accounts Dashboard');
  const [summary, setSummary] = useState(null);

  useEffect(() => { billingApi.getSummary().then((res) => setSummary(res.data.data)); }, []);
  if (!summary) return <PageLoader />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total Revenue" value={`৳${summary.totalRevenue.toLocaleString()}`} icon={Wallet} tone="stable" />
      <StatCard label="Outstanding" value={`৳${summary.totalOutstanding.toLocaleString()}`} icon={AlertTriangle} tone="critical" />
      <StatCard label="Total Invoices" value={summary.invoiceCount} icon={Receipt} tone="brand" sub={`${summary.paidCount} paid · ${summary.unpaidCount} unpaid`} />
    </div>
  );
}
