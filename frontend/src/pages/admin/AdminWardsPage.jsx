import { useEffect, useState } from 'react';
import { Plus, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import { wardApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, FormField, Select } from '@/components/ui/Input';
import { EmptyState, PageLoader } from '@/components/common/Loading';

export default function AdminWardsPage() {
  usePageTitle('Wards & Beds');
  const [wards, setWards] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'general', floor: '', chargePerDay: '' });

  const load = () => wardApi.getAll().then((res) => setWards(res.data.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await wardApi.create(form);
      toast.success('Ward created');
      setModalOpen(false);
      setForm({ name: '', type: 'general', floor: '', chargePerDay: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ward');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Ward</Button>
      </div>

      {!wards ? (
        <PageLoader />
      ) : wards.length === 0 ? (
        <EmptyState title="No wards yet" icon={BedDouble} description="Create your first ward to start managing beds." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wards.map((w) => (
            <Card key={w._id}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-light p-2.5 text-brand-dark"><BedDouble size={20} /></div>
                  <div>
                    <h3 className="font-display font-semibold text-ink">{w.name}</h3>
                    <p className="text-xs text-ink/50 capitalize">{w.type} · Floor {w.floor || '—'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-ink/50 mb-1">
                    <span>Occupancy</span>
                    <span>{w.occupiedBeds}/{w.totalBeds}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-paper overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full"
                      style={{ width: `${w.totalBeds ? (w.occupiedBeds / w.totalBeds) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink/60">৳{w.chargePerDay}/day</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Ward">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Ward name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['general', 'icu', 'private', 'pediatric', 'maternity', 'emergency'].map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="Floor">
              <Input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Charge per day (৳)">
            <Input type="number" value={form.chargePerDay} onChange={(e) => setForm({ ...form, chargePerDay: e.target.value })} />
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Create Ward</Button>
        </form>
      </Modal>
    </div>
  );
}
