import { useEffect, useState } from 'react';
import { labApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

export default function PatientLabPage() {
  usePageTitle('Lab Reports');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { labApi.getAll().then((res) => { setTests(res.data.data); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={tests}
            onRowClick={(t) => t.status === 'completed' && setSelected(t)}
            emptyTitle="No lab tests yet"
            columns={[
              { key: 'test', label: 'Test', render: (t) => t.testName },
              { key: 'status', label: 'Status', render: (t) => <Badge status={t.status} /> },
              { key: 'date', label: 'Date', render: (t) => format(new Date(t.createdAt), 'MMM d, yyyy') },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.testName}>
        {selected && (
          <div className="space-y-3">
            {selected.results?.length > 0 ? (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-ink/50 text-xs"><th className="pb-2">Parameter</th><th className="pb-2">Value</th><th className="pb-2">Range</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {selected.results.map((r, i) => (
                    <tr key={i}>
                      <td className="py-2">{r.parameter}</td>
                      <td className="py-2 font-medium">{r.value} {r.unit}</td>
                      <td className="py-2 text-ink/50">{r.normalRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-ink/50">No detailed parameters recorded.</p>}
            {selected.remarks && <p className="text-sm text-ink/60 mt-2">{selected.remarks}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
