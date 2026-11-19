import { useEffect, useState } from 'react';
import { Check, X, CalendarDays, Clock3, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi, medicalRecordApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/ui/Modal';
import { EmptyState, Spinner } from '@/components/common/Loading';
import { format } from 'date-fns';

export default function DoctorPatientsPage() {
  usePageTitle('My Patients');
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        appointmentApi.getAll({ status: 'pending' }),
        appointmentApi.getAll(),
      ]);
      setRequests(pendingRes.data.data);
      const patientById = new Map();
      allRes.data.data
        .filter((appointment) => ['confirmed', 'in_progress', 'completed'].includes(appointment.status))
        .forEach((appointment) => {
          if (appointment.patient?._id) patientById.set(appointment.patient._id, appointment.patient);
        });
      setPatients([...patientById.values()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load your patient requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reviewRequest = async (appointment, status) => {
    setSavingId(appointment._id);
    try {
      await appointmentApi.updateStatus(appointment._id, status);
      toast.success(status === 'confirmed' ? 'Appointment approved' : 'Appointment declined');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update this request');
    } finally {
      setSavingId(null);
    }
  };

  const openHistory = async (patient) => {
    setSelected(patient);
    setHistory(null);
    try {
      const res = await medicalRecordApi.getPatientHistory(patient._id);
      setHistory(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load medical history');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div><CardTitle>Consultation requests</CardTitle><p className="mt-1 text-xs text-ink/50">Review and approve patients requesting an appointment.</p></div>
          <Badge variant={requests.length ? 'caution' : 'neutral'}>{requests.length} pending</Badge>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-10"><Spinner /></div> : requests.length === 0 ? (
            <EmptyState title="No requests to review" description="New appointment requests from patients will appear here." />
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request._id} className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-paper/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-light text-brand-dark"><UserRound size={19} /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{request.patient?.user?.name || 'Patient'}</p>
                      <p className="mt-1 text-xs text-ink/55">{request.patient?.user?.email} {request.patient?.user?.phone ? `· ${request.patient.user.phone}` : ''}</p>
                      <p className="mt-2 text-sm text-ink/75">{request.reason || 'Consultation requested'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-ink/55">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{format(new Date(request.date), 'MMM d, yyyy')}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{request.startTime}–{request.endTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 sm:pl-4">
                    <Button size="sm" loading={savingId === request._id} onClick={() => reviewRequest(request, 'confirmed')}><Check size={15} /> Approve</Button>
                    <Button size="sm" variant="outline" disabled={!!savingId} onClick={() => reviewRequest(request, 'cancelled')}><X size={15} /> Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My patients</CardTitle><p className="mt-1 text-xs text-ink/50">Patients with an approved or completed consultation.</p></CardHeader>
        <CardContent>
          <DataTable loading={loading} data={patients} onRowClick={openHistory} emptyTitle="No approved patients yet" emptyDescription="Approve a consultation request to add the patient here." columns={[
            { key: 'reg', label: 'Reg. No.', render: (patient) => <span className="font-mono text-xs">{patient.registrationNumber}</span> },
            { key: 'name', label: 'Patient', render: (patient) => patient.user?.name },
            { key: 'email', label: 'Email', render: (patient) => patient.user?.email || '—' },
            { key: 'blood', label: 'Blood group', render: (patient) => <Badge variant="accent">{patient.bloodGroup || 'Unknown'}</Badge> },
            { key: 'phone', label: 'Phone', render: (patient) => patient.user?.phone || '—' },
          ]} />
        </CardContent>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.user?.name || 'Patient'} · Medical history`} size="lg">
        {!history ? <div className="flex justify-center py-8"><Spinner /></div> : history.length === 0 ? <EmptyState title="No visit history yet" /> : (
          <div className="space-y-4">{history.map((record) => (
            <div key={record._id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3"><p className="text-xs text-ink/50">{format(new Date(record.visitDate), 'MMM d, yyyy')}</p><p className="text-xs text-ink/50">Dr. {record.doctor?.user?.name}</p></div>
              {record.chiefComplaint && <p className="mt-2 text-sm font-semibold text-ink">{record.chiefComplaint}</p>}
              {record.diagnosis?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{record.diagnosis.map((diagnosis, index) => <Badge key={index} variant="critical">{diagnosis}</Badge>)}</div>}
              {record.treatmentPlan && <p className="mt-2 text-sm text-ink/60">{record.treatmentPlan}</p>}
            </div>
          ))}</div>
        )}
      </Modal>
    </div>
  );
}
