import { useEffect, useState } from 'react';
import { patientApi, medicalRecordApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/ui/Modal';
import { EmptyState, Spinner } from '@/components/common/Loading';
import { format } from 'date-fns';

export default function DoctorPatientsPage() {
  usePageTitle('My Patients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    patientApi.getAll().then((res) => {
      setPatients(res.data.data);
      setLoading(false);
    });
  }, []);

  const openHistory = async (patient) => {
    setSelected(patient);
    setHistory(null);
    const res = await medicalRecordApi.getPatientHistory(patient._id);
    setHistory(res.data.data);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={patients}
            onRowClick={openHistory}
            emptyTitle="No patients assigned yet"
            columns={[
              { key: 'reg', label: 'Reg. No.', render: (p) => <span className="font-mono text-xs">{p.registrationNumber}</span> },
              { key: 'name', label: 'Name', render: (p) => p.user?.name },
              { key: 'bloodGroup', label: 'Blood Group', render: (p) => <Badge variant="accent">{p.bloodGroup}</Badge> },
              { key: 'phone', label: 'Phone', render: (p) => p.user?.phone || '—' },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.user?.name} — Medical History`} size="lg">
        {!history ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : history.length === 0 ? (
          <EmptyState title="No visit history yet" />
        ) : (
          <div className="space-y-4">
            {history.map((r) => (
              <div key={r._id} className="rounded-lg border border-border p-4">
                <div className="flex justify-between items-start">
                  <p className="text-xs text-ink/50">{format(new Date(r.visitDate), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-ink/50">Dr. {r.doctor?.user?.name}</p>
                </div>
                {r.chiefComplaint && <p className="mt-2 text-sm font-medium text-ink">{r.chiefComplaint}</p>}
                {r.diagnosis?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.diagnosis.map((d, i) => <Badge key={i} variant="critical">{d}</Badge>)}
                  </div>
                )}
                {r.treatmentPlan && <p className="mt-2 text-sm text-ink/60">{r.treatmentPlan}</p>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
