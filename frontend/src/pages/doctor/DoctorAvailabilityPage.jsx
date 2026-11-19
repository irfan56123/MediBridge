import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/common/Loading';

const pad = (value) => String(value).padStart(2, '0');
const keyFor = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const todayKey = keyFor(new Date());

export default function DoctorAvailabilityPage() {
  usePageTitle('My Availability');
  const [profile, setProfile] = useState(null);
  const [duration, setDuration] = useState(30);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dateAvailability, setDateAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [saving, setSaving] = useState(false);

  const toEntries = (availability) => Object.entries(availability)
    .map(([date, times]) => ({ date, available: true, ...times }));

  const saveAvailability = async (availability = dateAvailability, durationValue = duration, showSuccess = true) => {
    if (!profile) return false;
    setSaving(true);
    try {
      const entries = toEntries(availability);
      const res = await doctorApi.updateAvailability(profile._id, {
        availability: profile.availability || [],
        dateAvailability: entries,
        slotDurationMinutes: Number(durationValue),
      });
      const savedProfile = res.data.data;
      const savedDates = savedProfile.dateAvailability || [];
      if (entries.length > 0 && savedDates.length === 0) {
        throw new Error('The server did not save calendar availability. Deploy the latest backend and try again.');
      }
      setProfile(savedProfile);
      setDuration(savedProfile.slotDurationMinutes || Number(durationValue));
      setDateAvailability(Object.fromEntries(savedDates.filter((entry) => entry.available).map((entry) => [entry.date, { startTime: entry.startTime, endTime: entry.endTime }])));
      if (showSuccess) toast.success('Availability calendar saved');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update availability');
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    doctorApi.getMyProfile().then((res) => {
      const doc = res.data.data;
      setProfile(doc);
      setDuration(doc.slotDurationMinutes || 30);
      setDateAvailability(Object.fromEntries((doc.dateAvailability || []).filter((entry) => entry.available).map((entry) => [entry.date, { startTime: entry.startTime, endTime: entry.endTime }])));
    }).catch((err) => toast.error(err.response?.data?.message || 'Could not load availability'));
  }, []);

  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);

  const toggleDate = (dateKey) => {
    const next = { ...dateAvailability };
    if (next[dateKey]) {
      delete next[dateKey];
      if (selectedDate === dateKey) setSelectedDate('');
    } else {
      next[dateKey] = { startTime: '09:00', endTime: '17:00' };
      setSelectedDate(dateKey);
    }
    setDateAvailability(next);
    void saveAvailability(next, duration, false);
  };

  const updateTime = (field, value) => setDateAvailability((prev) => ({ ...prev, [selectedDate]: { ...prev[selectedDate], [field]: value } }));

  const save = async () => {
    await saveAvailability();
  };

  if (!profile) return <PageLoader />;
  const selectedTimes = dateAvailability[selectedDate];

  return (
    <div className="max-w-3xl space-y-5">
      <div><h2 className="text-xl font-bold text-ink">Appointment availability</h2><p className="mt-1 text-sm text-ink/55">Calendar mein dates select karein jab aap patients ko dekh sakte hain. Baaki dates par booking available nahi hogi.</p></div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><CalendarDays size={19} className="text-brand" />{month.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></Button>
            <Button variant="outline" size="sm" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="py-2 text-xs font-semibold text-ink/45">{day}</div>)}
            {calendarDays.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} />;
              const dateKey = keyFor(date);
              const available = !!dateAvailability[dateKey];
              const past = dateKey < todayKey;
              return <button key={dateKey} type="button" disabled={past || saving} onClick={() => toggleDate(dateKey)} className={`relative grid aspect-square place-items-center rounded-xl border text-sm font-semibold transition ${available ? 'border-brand bg-brand text-white shadow-sm' : 'border-border bg-white text-ink hover:border-brand/50 hover:bg-brand-light/40'} ${past || saving ? 'cursor-not-allowed opacity-30' : ''}`} aria-pressed={available} aria-label={`${date.toDateString()}${available ? ', available' : ''}`}>
                {date.getDate()}{available && <Check size={12} className="absolute right-1 top-1" />}
              </button>;
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-ink/50"><span className="h-3 w-3 rounded bg-brand" /> Available for booking <span className="ml-3 h-3 w-3 rounded border border-border bg-white" /> Unavailable <span className="ml-2">Date selections save automatically.</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{selectedTimes ? `Hours for ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Appointment settings'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {selectedTimes ? <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-xs font-medium text-ink/60">Start time<Input type="time" value={selectedTimes.startTime} onChange={(e) => updateTime('startTime', e.target.value)} /></label>
            <label className="space-y-1 text-xs font-medium text-ink/60">End time<Input type="time" value={selectedTimes.endTime} onChange={(e) => updateTime('endTime', e.target.value)} /></label>
          </div> : <p className="text-sm text-ink/50">Time set karne ke liye calendar mein available date select karein.</p>}
          <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
            <label className="text-sm text-ink/60" htmlFor="slot-duration">Appointment duration</label>
            <Input id="slot-duration" type="number" min="5" max="240" step="5" className="w-24" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <span className="text-sm text-ink/50">minutes per patient</span>
          </div>
          <Button onClick={save} loading={saving}><Check size={16} /> Save availability</Button>
        </CardContent>
      </Card>
    </div>
  );
}
