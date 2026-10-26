import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { pharmacyApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Input, FormField, Select } from '@/components/ui/Input';
import DataTable from '@/components/common/DataTable';

export default function PharmacistInventoryPage() {
  usePageTitle('Inventory');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', genericName: '', category: '', unit: 'tablet', stockQuantity: '', unitPrice: '', reorderLevel: 20 });

  const load = (q) => {
    setLoading(true);
    pharmacyApi.getMedicines(q ? { search: q } : {}).then((res) => { setMedicines(res.data.data); setLoading(false); });
  };
  useEffect(() => load(), []);
  useEffect(() => { const t = setTimeout(() => load(search), 350); return () => clearTimeout(t); }, [search]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await pharmacyApi.createMedicine(form);
      toast.success('Medicine added');
      setModalOpen(false);
      setForm({ name: '', genericName: '', category: '', unit: 'tablet', stockQuantity: '', unitPrice: '', reorderLevel: 20 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  const restock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await pharmacyApi.restock(restockTarget._id, restockQty);
      toast.success('Stock updated');
      setRestockTarget(null);
      setRestockQty('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
          <Input placeholder="Search medicines..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Medicine</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={medicines}
            emptyTitle="No medicines found"
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'category', label: 'Category', render: (m) => m.category || '—' },
              { key: 'stock', label: 'Stock', render: (m) => <span className={m.stockQuantity <= m.reorderLevel ? 'text-critical font-semibold' : ''}>{m.stockQuantity}</span> },
              { key: 'price', label: 'Unit Price', render: (m) => `৳${m.unitPrice}` },
              { key: 'status', label: 'Status', render: (m) => <Badge variant={m.stockQuantity <= m.reorderLevel ? 'critical' : 'stable'}>{m.stockQuantity <= m.reorderLevel ? 'Low Stock' : 'In Stock'}</Badge> },
              { key: 'actions', label: '', render: (m) => <Button size="sm" variant="outline" onClick={() => setRestockTarget(m)}>Restock</Button> },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Medicine">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Medicine name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Generic name">
            <Input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </FormField>
            <FormField label="Unit">
              <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'other'].map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Initial stock">
              <Input type="number" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
            </FormField>
            <FormField label="Unit price (৳)">
              <Input type="number" required value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
            </FormField>
            <FormField label="Reorder level">
              <Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
            </FormField>
          </div>
          <Button type="submit" className="w-full" loading={saving}>Add Medicine</Button>
        </form>
      </Modal>

      <Modal open={!!restockTarget} onClose={() => setRestockTarget(null)} title={`Restock ${restockTarget?.name}`}>
        <form onSubmit={restock} className="space-y-4">
          <FormField label="Quantity to add">
            <Input type="number" required min="1" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} />
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Update Stock</Button>
        </form>
      </Modal>
    </div>
  );
}
