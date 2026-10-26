import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { prescriptionApi, patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Input, Select, FormField, Textarea, Label } from '@/components/ui/Input';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

const emptyMedicine = { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1 };

export default function DoctorPrescriptionsPage() {
  usePageTitle('Prescriptions');
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patient: '', notes: '', medicines: [{ ...emptyMedicine }] });

  const load = () => {
    setLoading(true);
    prescriptionApi.getAll().then((res) => {
      setPrescriptions(res.data.data);
      setLoading(false);
    });
  };
  useEffect(load, []);
  useEffect(() => { patientApi.getAll().then((res) => setPatients(res.data.data)); }, []);

  const updateMedicine = (idx, field, value) => {
    const meds = [...form.medicines];
    meds[idx] = { ...meds[idx], [field]: value };
    setForm({ ...form, medicines: meds });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await prescriptionApi.create(form);
      toast.success('Prescription created');
      setModalOpen(false);
      setForm({ patient: '', notes: '', medicines: [{ ...emptyMedicine }] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> New Prescription</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={prescriptions}
            emptyTitle="No prescriptions written yet"
            columns={[
              { key: 'patient', label: 'Patient', render: (p) => p.patient?.user?.name },
              { key: 'medicines', label: 'Medicines', render: (p) => p.medicines.map((m) => m.medicineName).join(', ') },
              { key: 'status', label: 'Status', render: (p) => <Badge status={p.status} /> },
              { key: 'date', label: 'Date', render: (p) => format(new Date(p.createdAt), 'MMM d, yyyy') },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Prescription" size="lg">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Patient">
            <Select required value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name} ({p.registrationNumber})</option>)}
            </Select>
          </FormField>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="!mb-0">Medicines</Label>
              <button type="button" onClick={() => setForm({ ...form, medicines: [...form.medicines, { ...emptyMedicine }] })} className="text-xs font-medium text-brand hover:underline">
                + Add medicine
              </button>
            </div>
            {form.medicines.map((m, idx) => (
              <div key={idx} className="rounded-lg border border-border p-3 space-y-2 relative">
                {form.medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, medicines: form.medicines.filter((_, i) => i !== idx) })}
                    className="absolute top-2 right-2 text-ink/30 hover:text-critical"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <Input placeholder="Medicine name" required value={m.medicineName} onChange={(e) => updateMedicine(idx, 'medicineName', e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Dosage (500mg)" required value={m.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} />
                  <Input placeholder="Frequency" required value={m.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} />
                  <Input placeholder="Duration" required value={m.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Instructions" value={m.instructions} onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)} />
                  <Input type="number" min="1" placeholder="Quantity" required value={m.quantity} onChange={(e) => updateMedicine(idx, 'quantity', Number(e.target.value))} />
                </div>
              </div>
            ))}
          </div>

          <FormField label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </FormField>

          <Button type="submit" className="w-full" loading={saving}>Create Prescription</Button>
        </form>
      </Modal>
    </div>
  );
}
