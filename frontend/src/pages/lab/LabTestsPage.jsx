import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { labApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, FormField, Textarea } from '@/components/ui/Input';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

const emptyResult = { parameter: '', value: '', unit: '', normalRange: '' };

export default function LabTestsPage() {
  usePageTitle('Test Queue');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultModal, setResultModal] = useState(null);
  const [results, setResults] = useState([{ ...emptyResult }]);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    labApi.getAll().then((res) => { setTests(res.data.data); setLoading(false); });
  };
  useEffect(load, []);

  const collectSample = async (id) => {
    try {
      await labApi.updateStatus(id, 'sample_collected');
      toast.success('Sample marked collected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const openResults = (test) => {
    setResultModal(test);
    setResults([{ ...emptyResult }]);
    setRemarks('');
  };

  const submitResults = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await labApi.submitResults(resultModal._id, { results, remarks });
      toast.success('Results submitted');
      setResultModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit results');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={tests}
            emptyTitle="No lab tests in queue"
            columns={[
              { key: 'patient', label: 'Patient', render: (t) => t.patient?.user?.name },
              { key: 'test', label: 'Test', render: (t) => t.testName },
              { key: 'priority', label: 'Priority', render: (t) => <Badge variant={t.priority === 'emergency' ? 'critical' : t.priority === 'urgent' ? 'caution' : 'neutral'}>{t.priority}</Badge> },
              { key: 'status', label: 'Status', render: (t) => <Badge status={t.status} /> },
              { key: 'date', label: 'Date', render: (t) => format(new Date(t.createdAt), 'MMM d, yyyy') },
              { key: 'actions', label: '', render: (t) => (
                <div className="flex gap-2">
                  {t.status === 'requested' && <Button size="sm" variant="outline" onClick={() => collectSample(t._id)}>Collect Sample</Button>}
                  {['sample_collected', 'in_progress'].includes(t.status) && <Button size="sm" onClick={() => openResults(t)}>Enter Results</Button>}
                </div>
              ) },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={!!resultModal} onClose={() => setResultModal(null)} title={`Results — ${resultModal?.testName}`} size="lg">
        <form onSubmit={submitResults} className="space-y-4">
          {results.map((r, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 rounded-lg border border-border p-3">
              <Input placeholder="Parameter" value={r.parameter} onChange={(e) => { const next = [...results]; next[idx].parameter = e.target.value; setResults(next); }} />
              <Input placeholder="Value" value={r.value} onChange={(e) => { const next = [...results]; next[idx].value = e.target.value; setResults(next); }} />
              <Input placeholder="Unit" value={r.unit} onChange={(e) => { const next = [...results]; next[idx].unit = e.target.value; setResults(next); }} />
              <Input placeholder="Normal range" value={r.normalRange} onChange={(e) => { const next = [...results]; next[idx].normalRange = e.target.value; setResults(next); }} />
            </div>
          ))}
          <button type="button" onClick={() => setResults([...results, { ...emptyResult }])} className="text-xs font-medium text-brand hover:underline">
            + Add parameter
          </button>
          <FormField label="Remarks">
            <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Submit Results</Button>
        </form>
      </Modal>
    </div>
  );
}
