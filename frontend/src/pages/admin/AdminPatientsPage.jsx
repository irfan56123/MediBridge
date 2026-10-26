import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/ui/Modal';

export default function AdminPatientsPage() {
  usePageTitle('Patients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = (q) => {
    setLoading(true);
    patientApi.getAll(q ? { search: q } : {}).then((res) => {
      setPatients(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search]);

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
              { key: 'admitted', label: 'Status', render: (p) => <Badge variant={p.isAdmitted ? 'caution' : 'stable'}>{p.isAdmitted ? 'Admitted' : 'Outpatient'}</Badge> },
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
            </div>
            {selected.allergies?.length > 0 && (
              <div><p className="text-ink/50">Allergies</p><p>{selected.allergies.join(', ')}</p></div>
            )}
            {selected.chronicConditions?.length > 0 && (
              <div><p className="text-ink/50">Chronic Conditions</p><p>{selected.chronicConditions.join(', ')}</p></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
