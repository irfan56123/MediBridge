import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingApi, patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Input, Select, FormField } from '@/components/ui/Input';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

const emptyItem = { description: '', category: 'consultation', quantity: 1, unitPrice: '' };

export default function AccountantInvoicesPage() {
  usePageTitle('Invoices');
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash' });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: '', items: [{ ...emptyItem }], discount: 0, tax: 0 });

  const load = () => {
    setLoading(true);
    billingApi.getAll().then((res) => { setInvoices(res.data.data); setLoading(false); });
  };
  useEffect(load, []);
  useEffect(() => { patientApi.getAll().then((res) => setPatients(res.data.data)); }, []);

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await billingApi.create(form);
      toast.success('Invoice created');
      setModalOpen(false);
      setForm({ patientId: '', items: [{ ...emptyItem }], discount: 0, tax: 0 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await billingApi.recordPayment(payModal._id, payForm);
      toast.success('Payment recorded');
      setPayModal(null);
      setPayForm({ amount: '', method: 'cash' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Create Invoice</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={invoices}
            emptyTitle="No invoices yet"
            columns={[
              { key: 'invoiceNumber', label: 'Invoice #', render: (i) => <span className="font-mono text-xs">{i.invoiceNumber}</span> },
              { key: 'patient', label: 'Patient', render: (i) => i.patient?.user?.name },
              { key: 'total', label: 'Total', render: (i) => `৳${i.totalAmount.toLocaleString()}` },
              { key: 'balance', label: 'Balance', render: (i) => `৳${(i.totalAmount - i.amountPaid).toLocaleString()}` },
              { key: 'status', label: 'Status', render: (i) => <Badge status={i.paymentStatus} /> },
              { key: 'date', label: 'Date', render: (i) => format(new Date(i.createdAt), 'MMM d, yyyy') },
              { key: 'actions', label: '', render: (i) => (
                i.paymentStatus !== 'paid' && <Button size="sm" onClick={() => { setPayModal(i); setPayForm({ amount: i.totalAmount - i.amountPaid, method: 'cash' }); }}>Record Payment</Button>
              ) },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Invoice" size="lg">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Patient">
            <Select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name} ({p.registrationNumber})</option>)}
            </Select>
          </FormField>

          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Line items</p>
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2">
                <Input className="col-span-2" placeholder="Description" required value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} />
                <Select value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)}>
                  {['consultation', 'lab_test', 'medicine', 'ward_charge', 'procedure', 'other'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </Select>
                <Input type="number" placeholder="Qty" required value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} />
                <Input type="number" placeholder="Price" required value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))} />
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })} className="text-xs font-medium text-brand hover:underline">
              + Add item
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Discount (৳)">
              <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
            </FormField>
            <FormField label="Tax (৳)">
              <Input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} />
            </FormField>
          </div>

          <Button type="submit" className="w-full" loading={saving}>Create Invoice</Button>
        </form>
      </Modal>

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title={`Record Payment — ${payModal?.invoiceNumber}`}>
        <form onSubmit={submitPayment} className="space-y-4">
          <FormField label="Amount (৳)">
            <Input type="number" required value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })} />
          </FormField>
          <FormField label="Payment method">
            <Select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
              {['cash', 'card', 'insurance', 'mobile_banking'].map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </Select>
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Record Payment</Button>
        </form>
      </Modal>
    </div>
  );
}
