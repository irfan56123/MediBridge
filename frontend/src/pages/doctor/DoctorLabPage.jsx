import { useEffect, useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { labApi, patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Input, Select, FormField } from '@/components/ui/Input';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

export default function DoctorLabPage() {
  usePageTitle('Lab Requests');
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patient: '', testName: '', testType: '', priority: 'routine' });
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    labApi.getAll().then((res) => { setTests(res.data.data); setLoading(false); });
  };
  useEffect(load, []);
  useEffect(() => { patientApi.getAll().then((res) => setPatients(res.data.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await labApi.create(form);
      toast.success('Lab test requested');
      setModalOpen(false);
      setForm({ patient: '', testName: '', testType: '', priority: 'routine' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Request Test</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={tests}
            emptyTitle="No lab tests requested yet"
            columns={[
              { key: 'patient', label: 'Patient', render: (t) => t.patient?.user?.name },
              { key: 'testName', label: 'Test' },
              { key: 'priority', label: 'Priority', render: (t) => <Badge variant={t.priority === 'emergency' ? 'critical' : t.priority === 'urgent' ? 'caution' : 'neutral'}>{t.priority}</Badge> },
              { key: 'status', label: 'Status', render: (t) => <Badge status={t.status} /> },
              { key: 'report', label: '', render: (t) => t.status === 'completed' && <button className="text-xs font-semibold text-brand hover:underline" onClick={(event) => { event.stopPropagation(); setSelected(t); }}>View result</button> },
              { key: 'date', label: 'Requested', render: (t) => format(new Date(t.createdAt), 'MMM d, yyyy') },
            ]}
            onRowClick={(t) => t.status === 'completed' && setSelected(t)}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request Lab Test">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Patient">
            <Select required value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Test name">
            <Input required placeholder="e.g. Complete Blood Count" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} />
          </FormField>
          <FormField label="Test type">
            <Input placeholder="e.g. Hematology" value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })} />
          </FormField>
          <FormField label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </Select>
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Submit Request</Button>
        </form>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.testName}>
        {selected && <div className="space-y-3">
          {selected.results?.length > 0 ? <table className="w-full text-sm"><thead><tr className="text-left text-xs text-ink/50"><th className="pb-2">Parameter</th><th className="pb-2">Value</th><th className="pb-2">Range</th></tr></thead><tbody className="divide-y divide-border">{selected.results.map((result, index) => <tr key={index}><td className="py-2">{result.parameter}</td><td className="py-2 font-medium">{result.value} {result.unit}</td><td className="py-2 text-ink/50">{result.normalRange}</td></tr>)}</tbody></table> : <p className="text-sm text-ink/50">No detailed parameters recorded.</p>}
          {selected.remarks && <p className="text-sm text-ink/60">{selected.remarks}</p>}
          {selected.resultFileUrl && <a href={selected.resultFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"><ExternalLink size={15} /> Open report copy</a>}
        </div>}
      </Modal>
    </div>
  );
}
