import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi, patientApi, doctorApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Select, FormField, Input } from '@/components/ui/Input';
import DataTable from '@/components/common/DataTable';
import { format } from 'date-fns';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

export default function ReceptionistAppointmentsPage() {
  usePageTitle('Appointments');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', reason: '' });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const load = () => {
    setLoading(true);
    appointmentApi.getAll().then((res) => { setAppointments(res.data.data); setLoading(false); });
  };
  useEffect(load, []);
  useEffect(() => {
    patientApi.getAll().then((res) => setPatients(res.data.data));
    doctorApi.getAll().then((res) => setDoctors(res.data.data));
  }, []);

  useEffect(() => {
    if (form.doctorId && form.date) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      appointmentApi.getAvailableSlots(form.doctorId, form.date).then((res) => {
        setSlots(res.data.data);
        setLoadingSlots(false);
      });
    } else {
      setSlots([]);
    }
  }, [form.doctorId, form.date]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return toast.error('Please select a time slot');
    setSaving(true);
    try {
      await appointmentApi.create({
        patientId: form.patientId,
        doctorId: form.doctorId,
        date: form.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: form.reason,
      });
      toast.success('Appointment booked');
      setModalOpen(false);
      setForm({ patientId: '', doctorId: '', date: '', reason: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Book Appointment</Button>
      </div>

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
              { key: 'doctor', label: 'Doctor', render: (a) => `Dr. ${a.doctor?.user?.name}` },
              { key: 'status', label: 'Status', render: (a) => (
                <Select value={a.status} onChange={(e) => updateStatus(a._id, e.target.value)} className="w-36 h-8 text-xs">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </Select>
              ) },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Book Appointment" size="lg">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Patient">
            <Select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.user?.name} ({p.registrationNumber})</option>)}
            </Select>
          </FormField>
          <FormField label="Doctor">
            <Select required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.user?.name} — {d.specialization}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <Input type="date" required min={format(new Date(), 'yyyy-MM-dd')} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </FormField>

          {form.doctorId && form.date && (
            <div>
              <p className="text-sm font-medium text-ink mb-2">Available slots</p>
              {loadingSlots ? (
                <p className="text-sm text-ink/50">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-ink/50">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s.startTime}
                      onClick={() => setSelectedSlot(s)}
                      className={`rounded-lg border px-2 py-1.5 text-xs font-mono transition-colors ${
                        selectedSlot?.startTime === s.startTime ? 'bg-brand text-white border-brand' : 'border-border hover:bg-paper'
                      }`}
                    >
                      {s.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <FormField label="Reason for visit">
            <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </FormField>

          <Button type="submit" className="w-full" loading={saving} disabled={!selectedSlot}>Confirm Booking</Button>
        </form>
      </Modal>
    </div>
  );
}
