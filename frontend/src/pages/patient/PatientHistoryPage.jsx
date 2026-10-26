import { useEffect, useState } from 'react';
import { medicalRecordApi, patientApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { EmptyState, PageLoader } from '@/components/common/Loading';
import { format } from 'date-fns';

export default function PatientHistoryPage() {
  usePageTitle('Medical History');
  const [history, setHistory] = useState(null);

  useEffect(() => {
    patientApi.getMyProfile().then((res) => {
      medicalRecordApi.getPatientHistory(res.data.data._id).then((r) => setHistory(r.data.data));
    });
  }, []);

  if (!history) return <PageLoader />;
  if (history.length === 0) return <EmptyState title="No medical history yet" description="Your visit records will appear here after your first consultation." />;

  return (
    <div className="space-y-4">
      {history.map((r) => (
        <Card key={r._id}>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-ink/50">{format(new Date(r.visitDate), 'MMMM d, yyyy')}</p>
                <p className="text-sm font-medium text-ink mt-1">Dr. {r.doctor?.user?.name}</p>
              </div>
            </div>
            {r.chiefComplaint && <p className="mt-3 text-sm text-ink">{r.chiefComplaint}</p>}
            {r.diagnosis?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.diagnosis.map((d, i) => <Badge key={i} variant="critical">{d}</Badge>)}
              </div>
            )}
            {r.treatmentPlan && <p className="mt-2 text-sm text-ink/60">{r.treatmentPlan}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
