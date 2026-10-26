import { useEffect, useState } from 'react';
import { billingApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';
import StatCard from '@/components/common/StatCard';
import { Wallet, Receipt, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminBillingPage() {
  usePageTitle('Billing Overview');
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([billingApi.getAll(), billingApi.getSummary()]).then(([invRes, sumRes]) => {
      setInvoices(invRes.data.data);
      setSummary(sumRes.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={`৳${summary.totalRevenue.toLocaleString()}`} icon={Wallet} tone="stable" />
          <StatCard label="Outstanding" value={`৳${summary.totalOutstanding.toLocaleString()}`} icon={AlertTriangle} tone="critical" />
          <StatCard label="Total Invoices" value={summary.invoiceCount} icon={Receipt} tone="brand" sub={`${summary.paidCount} paid · ${summary.unpaidCount} unpaid`} />
        </div>
      )}

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={invoices}
            emptyTitle="No invoices yet"
            columns={[
              { key: 'invoiceNumber', label: 'Invoice #', render: (i) => <span className="font-mono text-xs">{i.invoiceNumber}</span> },
              { key: 'patient', label: 'Patient', render: (i) => i.patient?.user?.name },
              { key: 'total', label: 'Amount', render: (i) => `৳${i.totalAmount.toLocaleString()}` },
              { key: 'paid', label: 'Paid', render: (i) => `৳${i.amountPaid.toLocaleString()}` },
              { key: 'status', label: 'Status', render: (i) => <Badge status={i.paymentStatus} /> },
              { key: 'date', label: 'Date', render: (i) => format(new Date(i.createdAt), 'MMM d, yyyy') },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
