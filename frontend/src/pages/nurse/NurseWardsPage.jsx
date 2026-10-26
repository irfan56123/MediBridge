import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { wardApi, patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Select, FormField, Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/common/Loading';

export default function NurseWardsPage() {
  usePageTitle('Wards & Beds');
  const [wards, setWards] = useState(null);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admitModal, setAdmitModal] = useState(null);
  const [form, setForm] = useState({ patientId: '', expectedDischargeDate: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    wardApi.getAll().then((res) => setWards(res.data.data));
    wardApi.getBeds().then((res) => setBeds(res.data.data));
  };
  useEffect(load, []);
  useEffect(() => { patientApi.getAll({ isAdmitted: false }).then((res) => setPatients(res.data.data)); }, []);

  const admit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await wardApi.admitPatient(admitModal._id, { patientId: form.patientId, expectedDischargeDate: form.expectedDischargeDate });
      toast.success('Patient admitted');
      setAdmitModal(null);
      setForm({ patientId: '', expectedDischargeDate: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to admit patient');
    } finally {
      setSaving(false);
    }
  };

  const discharge = async (bedId) => {
    try {
      await wardApi.dischargePatient(bedId);
      toast.success('Patient discharged');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to discharge');
    }
  };

  if (!wards) return <PageLoader />;

  return (
    <div className="space-y-6">
      {wards.map((ward) => (
        <Card key={ward._id}>
          <CardHeader><CardTitle>{ward.name} <span className="text-sm font-normal text-ink/50">({ward.occupiedBeds}/{ward.totalBeds} occupied)</span></CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {beds.filter((b) => b.ward?._id === ward._id).map((bed) => (
                <div key={bed._id} className={`rounded-lg border p-3 text-center ${bed.status === 'occupied' ? 'border-critical/30 bg-critical-light' : 'border-stable/30 bg-stable-light'}`}>
                  <p className="font-mono font-semibold text-ink">{bed.bedNumber}</p>
                  <Badge status={bed.status} className="mt-1" />
                  {bed.status === 'occupied' ? (
                    <>
                      <p className="mt-2 text-xs text-ink/60 truncate">{bed.currentPatient?.user?.name}</p>
                      <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => discharge(bed._id)}>Discharge</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => setAdmitModal(bed)}>Admit</Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Modal open={!!admitModal} onClose={() => setAdmitModal(null)} title={`Admit to Bed ${admitModal?.bedNumber}`}>
        <form onSubmit={admit} className="space-y-4">
          <FormField label="Patient">
            <Select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name} ({p.registrationNumber})</option>)}
            </Select>
          </FormField>
          <FormField label="Expected discharge date">
            <Input type="date" value={form.expectedDischargeDate} onChange={(e) => setForm({ ...form, expectedDischargeDate: e.target.value })} />
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Admit Patient</Button>
        </form>
      </Modal>
    </div>
  );
}
