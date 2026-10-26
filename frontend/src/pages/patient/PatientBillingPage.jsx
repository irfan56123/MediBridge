import { useEffect, useState } from 'react';
import { billingApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

export default function PatientBillingPage() {
  usePageTitle('Billing History');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { billingApi.getAll().then((res) => { setInvoices(res.data.data); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={invoices}
            onRowClick={setSelected}
            emptyTitle="No invoices yet"
            columns={[
              { key: 'invoiceNumber', label: 'Invoice #', render: (i) => <span className="font-mono text-xs">{i.invoiceNumber}</span> },
              { key: 'total', label: 'Total', render: (i) => `৳${i.totalAmount.toLocaleString()}` },
              { key: 'status', label: 'Status', render: (i) => <Badge status={i.paymentStatus} /> },
              { key: 'date', label: 'Date', render: (i) => format(new Date(i.createdAt), 'MMM d, yyyy') },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.invoiceNumber}>
        {selected && (
          <div className="space-y-3">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {selected.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{item.quantity} × ৳{item.unitPrice}</td>
                    <td className="py-2 text-right font-medium">৳{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border pt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>৳{selected.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-ink/60">Discount</span><span>-৳{selected.discount}</span></div>
              <div className="flex justify-between"><span className="text-ink/60">Tax</span><span>৳{selected.tax}</span></div>
              <div className="flex justify-between font-semibold text-ink"><span>Total</span><span>৳{selected.totalAmount}</span></div>
              <div className="flex justify-between text-stable"><span>Paid</span><span>৳{selected.amountPaid}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
