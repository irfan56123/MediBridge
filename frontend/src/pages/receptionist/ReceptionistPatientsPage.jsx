import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi, authApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Input, FormField, Select } from '@/components/ui/Input';
import DataTable from '@/components/common/DataTable';

export default function ReceptionistPatientsPage() {
  usePageTitle('Patients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', gender: '' });

  const load = (q) => {
    setLoading(true);
    patientApi.getAll(q ? { search: q } : {}).then((res) => { setPatients(res.data.data); setLoading(false); });
  };
  useEffect(() => load(), []);
  useEffect(() => { const t = setTimeout(() => load(search), 350); return () => clearTimeout(t); }, [search]);

  const register = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.register(form);
      toast.success('Patient registered');
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', gender: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
          <Input placeholder="Search patients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Register Patient</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={patients}
            emptyTitle="No patients found"
            columns={[
              { key: 'reg', label: 'Reg. No.', render: (p) => <span className="font-mono text-xs">{p.registrationNumber}</span> },
              { key: 'name', label: 'Name', render: (p) => p.user?.name },
              { key: 'phone', label: 'Phone', render: (p) => p.user?.phone || '—' },
              { key: 'admitted', label: 'Status', render: (p) => <Badge variant={p.isAdmitted ? 'caution' : 'stable'}>{p.isAdmitted ? 'Admitted' : 'Outpatient'}</Badge> },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register New Patient">
        <form onSubmit={register} className="space-y-4">
          <FormField label="Full name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label="Temporary password">
            <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <FormField label="Gender">
              <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </FormField>
          </div>
          <Button type="submit" className="w-full" loading={saving}>Register Patient</Button>
        </form>
      </Modal>
    </div>
  );
}
