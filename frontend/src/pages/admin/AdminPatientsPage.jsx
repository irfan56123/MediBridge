import { useEffect, useState } from 'react';
import { Search, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi, userApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function AdminPatientsPage() {
  usePageTitle('Patients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const load = (q) => {
    setLoading(true);
    patientApi.getAll({ ...(q ? { search: q } : {}), limit: 1000 }).then((res) => {
      setPatients(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const approvePatient = async (patient) => {
    setApprovingId(patient.user?._id);
    try {
      await userApi.toggleActive(patient.user._id);
      toast.success('Patient account approved');
      load(search);
      setSelected((current) => current?._id === patient._id
        ? { ...current, user: { ...current.user, isActive: true } }
        : current);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve patient');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
        <Input placeholder="Search by name, email, or reg. number" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={patients}
            onRowClick={setSelected}
            emptyTitle="No patients found"
            columns={[
              { key: 'reg', label: 'Reg. No.', render: (p) => <span className="font-mono text-xs">{p.registrationNumber}</span> },
              { key: 'name', label: 'Name', render: (p) => p.user?.name },
              { key: 'email', label: 'Email', render: (p) => p.user?.email },
              { key: 'bloodGroup', label: 'Blood Group', render: (p) => <Badge variant="accent">{p.bloodGroup}</Badge> },
              { key: 'account', label: 'Account', render: (p) => <Badge variant={p.user?.isActive ? 'stable' : 'caution'}>{p.user?.isActive ? 'Approved' : 'Pending approval'}</Badge> },
              { key: 'admitted', label: 'Care status', render: (p) => <Badge variant={p.isAdmitted ? 'caution' : 'neutral'}>{p.isAdmitted ? 'Admitted' : 'Outpatient'}</Badge> },
              { key: 'action', label: '', render: (p) => !p.user?.isActive && <button disabled={approvingId === p.user?._id} onClick={(event) => { event.stopPropagation(); approvePatient(p); }} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-light px-3 py-2 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand hover:text-white disabled:opacity-50"><UserCheck size={14} />{approvingId === p.user?._id ? 'Approving...' : 'Approve'}</button> },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.user?.name}>
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-ink/50">Registration No.</p><p className="font-mono">{selected.registrationNumber}</p></div>
              <div><p className="text-ink/50">Blood Group</p><p>{selected.bloodGroup}</p></div>
              <div><p className="text-ink/50">Phone</p><p>{selected.user?.phone || '—'}</p></div>
              <div><p className="text-ink/50">Email</p><p>{selected.user?.email}</p></div>
              <div><p className="text-ink/50">Gender</p><p className="capitalize">{selected.user?.gender || '—'}</p></div>
              <div><p className="text-ink/50">Date of birth</p><p>{selected.user?.dateOfBirth ? new Date(selected.user.dateOfBirth).toLocaleDateString() : '—'}</p></div>
            </div>
            {selected.allergies?.length > 0 && (
              <div><p className="text-ink/50">Allergies</p><p>{selected.allergies.join(', ')}</p></div>
            )}
            {selected.chronicConditions?.length > 0 && (
              <div><p className="text-ink/50">Chronic Conditions</p><p>{selected.chronicConditions.join(', ')}</p></div>
            )}
            {!selected.user?.isActive && <Button className="w-full" loading={approvingId === selected.user?._id} onClick={() => approvePatient(selected)}><UserCheck size={16} /> Approve patient account</Button>}
          </div>
        )}
      </Modal>
    </div>
  );
}
