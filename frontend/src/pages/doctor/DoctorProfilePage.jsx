import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi, departmentApi, doctorApi, userApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FormField, Input, Select, Textarea } from '@/components/ui/Input';
import { PageLoader } from '@/components/common/Loading';

const dateForInput = (date) => date ? new Date(date).toISOString().slice(0, 10) : '';

export default function DoctorProfilePage() {
  usePageTitle('My Profile');
  const { setUser } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([doctorApi.getMyProfile(), authApi.getMe(), departmentApi.getAll()])
      .then(([doctorRes, userRes, departmentRes]) => {
        const profile = doctorRes.data.data;
        const user = userRes.data.data;
        setDoctor(profile);
        setDepartments(departmentRes.data.data);
        setForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || '',
          dateOfBirth: dateForInput(user.dateOfBirth),
          department: profile.department?._id || '',
          specialization: profile.specialization || '',
          licenseNumber: profile.licenseNumber || '',
          qualifications: (profile.qualifications || []).join(', '),
          yearsOfExperience: profile.yearsOfExperience || 0,
          consultationFee: profile.consultationFee || 0,
          isAvailableForBooking: profile.isAvailableForBooking,
          bio: profile.bio || '',
        });
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load your profile'))
      .finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await doctorApi.update(doctor._id, {
        department: form.department || null,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber,
        qualifications: form.qualifications.split(',').map((item) => item.trim()).filter(Boolean),
        yearsOfExperience: Number(form.yearsOfExperience),
        consultationFee: Number(form.consultationFee),
        isAvailableForBooking: form.isAvailableForBooking,
        bio: form.bio,
      });
      const userRes = await userApi.updateMyProfile({
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || null,
      });
      setUser(userRes.data.data);
      localStorage.setItem('hms_user', JSON.stringify(userRes.data.data));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save your profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <PageLoader />;

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-5">
      <Card>
        <CardHeader><CardTitle>Personal information</CardTitle><p className="mt-1 text-xs text-ink/50">Your contact details shown to patients and hospital staff.</p></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name"><Input required value={form.name} onChange={(event) => update('name', event.target.value)} /></FormField>
          <FormField label="Email address"><Input type="email" disabled value={form.email} /><p className="mt-1 text-xs text-ink/45">Email changes are managed by the administrator.</p></FormField>
          <FormField label="Phone"><Input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></FormField>
          <FormField label="Gender"><Select value={form.gender} onChange={(event) => update('gender', event.target.value)}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></Select></FormField>
          <FormField label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(event) => update('dateOfBirth', event.target.value)} /></FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Professional information</CardTitle><p className="mt-1 text-xs text-ink/50">Keep your credentials and consultation details up to date.</p></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Department"><Select value={form.department} onChange={(event) => update('department', event.target.value)}><option value="">Unassigned</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</Select></FormField>
          <FormField label="Specialization"><Input value={form.specialization} onChange={(event) => update('specialization', event.target.value)} placeholder="e.g. Cardiology" /></FormField>
          <FormField label="License number"><Input value={form.licenseNumber} onChange={(event) => update('licenseNumber', event.target.value)} /></FormField>
          <FormField label="Qualifications"><Input value={form.qualifications} onChange={(event) => update('qualifications', event.target.value)} placeholder="MBBS, MD (comma separated)" /></FormField>
          <FormField label="Years of experience"><Input type="number" min="0" value={form.yearsOfExperience} onChange={(event) => update('yearsOfExperience', event.target.value)} /></FormField>
          <FormField label="Consultation fee"><Input type="number" min="0" value={form.consultationFee} onChange={(event) => update('consultationFee', event.target.value)} /></FormField>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-paper/60 px-4 py-3 sm:col-span-2"><input type="checkbox" checked={form.isAvailableForBooking} onChange={(event) => update('isAvailableForBooking', event.target.checked)} className="h-4 w-4 accent-brand" /><span><span className="block text-sm font-semibold text-ink">Accept new appointments</span><span className="mt-0.5 block text-xs text-ink/50">Patients can see and request appointments with you while this is enabled.</span></span></label>
          <div className="sm:col-span-2"><FormField label="Professional bio"><Textarea rows={4} maxLength={1000} value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="Share your experience and approach to patient care." /></FormField></div>
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button type="submit" loading={saving}>Save profile</Button></div>
    </form>
  );
}
