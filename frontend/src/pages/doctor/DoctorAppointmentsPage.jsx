import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { appointmentApi, medicalRecordApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Select, Textarea, FormField, Input } from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

export default function DoctorAppointmentsPage() {
  usePageTitle('My Appointments');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitModal, setVisitModal] = useState(null);
  const [visitForm, setVisitForm] = useState({ chiefComplaint: '', diagnosis: '', treatmentPlan: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    appointmentApi.getAll().then((res) => {
      setAppointments(res.data.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openVisit = (appt) => {
    setVisitModal(appt);
    setVisitForm({ chiefComplaint: appt.reason || '', diagnosis: '', treatmentPlan: '', notes: '' });
  };

  const submitVisit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await medicalRecordApi.create({
        patient: visitModal.patient._id,
        appointment: visitModal._id,
        chiefComplaint: visitForm.chiefComplaint,
        diagnosis: visitForm.diagnosis.split(',').map((s) => s.trim()).filter(Boolean),
        treatmentPlan: visitForm.treatmentPlan,
        notes: visitForm.notes,
      });
      await appointmentApi.updateStatus(visitModal._id, 'completed');
      toast.success('Visit recorded and appointment completed');
      setVisitModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save visit');
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
            data={appointments}
            emptyTitle="No appointments"
            columns={[
              { key: 'date', label: 'Date', render: (a) => format(new Date(a.date), 'MMM d, yyyy') },
              { key: 'time', label: 'Time', render: (a) => a.startTime },
              { key: 'patient', label: 'Patient', render: (a) => a.patient?.user?.name },
              { key: 'reason', label: 'Reason', render: (a) => a.reason || '—' },
              { key: 'status', label: 'Status', render: (a) => (
                <Select
                  value={a.status}
                  onChange={(e) => updateStatus(a._id, e.target.value)}
                  className="w-36 h-8 text-xs"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </Select>
              ) },
              { key: 'actions', label: '', render: (a) => (
                a.status !== 'completed' && a.status !== 'cancelled' ? (
                  <Button size="sm" variant="outline" onClick={() => openVisit(a)}>Record Visit</Button>
                ) : null
              ) },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={!!visitModal} onClose={() => setVisitModal(null)} title={`Visit — ${visitModal?.patient?.user?.name}`} size="lg">
        <form onSubmit={submitVisit} className="space-y-4">
          <FormField label="Chief complaint">
            <Input value={visitForm.chiefComplaint} onChange={(e) => setVisitForm({ ...visitForm, chiefComplaint: e.target.value })} />
          </FormField>
          <FormField label="Diagnosis (comma-separated)">
            <Input value={visitForm.diagnosis} onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })} placeholder="e.g. Hypertension, Type 2 Diabetes" />
          </FormField>
          <FormField label="Treatment plan">
            <Textarea rows={3} value={visitForm.treatmentPlan} onChange={(e) => setVisitForm({ ...visitForm, treatmentPlan: e.target.value })} />
          </FormField>
          <FormField label="Notes">
            <Textarea rows={2} value={visitForm.notes} onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })} />
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Save & Complete Visit</Button>
        </form>
      </Modal>
    </div>
  );
}
