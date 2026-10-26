import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { doctorApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/common/Loading';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function DoctorAvailabilityPage() {
  usePageTitle('My Availability');
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorApi.getMyProfile().then((res) => {
      const doc = res.data.data;
      setProfile(doc);
      setDuration(doc.slotDurationMinutes || 30);
      const map = {};
      doc.availability.forEach((slot) => { map[slot.day] = { startTime: slot.startTime, endTime: slot.endTime }; });
      setSchedule(map);
    });
  }, []);

  const toggleDay = (day) => {
    setSchedule((prev) => {
      const next = { ...prev };
      if (next[day]) delete next[day];
      else next[day] = { startTime: '09:00', endTime: '17:00' };
      return next;
    });
  };

  const updateTime = (day, field, value) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const availability = Object.entries(schedule).map(([day, times]) => ({ day, ...times }));
      await doctorApi.updateAvailability(profile._id, { availability, slotDurationMinutes: duration });
      toast.success('Availability updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <PageLoader />;

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Weekly Schedule</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-ink/60">Slot duration (minutes)</span>
          <Input type="number" className="w-24" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>

        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-4 rounded-lg border border-border p-3">
            <label className="flex items-center gap-2 w-32 capitalize text-sm font-medium text-ink">
              <input type="checkbox" checked={!!schedule[day]} onChange={() => toggleDay(day)} className="accent-brand" />
              {day}
            </label>
            {schedule[day] && (
              <div className="flex items-center gap-2">
                <Input type="time" value={schedule[day].startTime} onChange={(e) => updateTime(day, 'startTime', e.target.value)} className="w-32" />
                <span className="text-ink/40">to</span>
                <Input type="time" value={schedule[day].endTime} onChange={(e) => updateTime(day, 'endTime', e.target.value)} className="w-32" />
              </div>
            )}
          </div>
        ))}

        <Button onClick={save} loading={saving} className="mt-2">Save Availability</Button>
      </CardContent>
    </Card>
  );
}
