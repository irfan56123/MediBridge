import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, AlertCircle, Mail, Lock, UserRound, Phone, CheckCircle2, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import EcgDivider from '@/components/layout/EcgDivider';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await register(form);
      setNotice('Your registration has been sent. An administrator must approve your account before you can sign in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#142b3b] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-28 -top-24 h-[430px] w-[430px] rounded-full border border-white/[0.08]" />
        <div className="absolute -right-8 -top-4 h-[300px] w-[300px] rounded-full border border-white/[0.08]" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-black/20"><HeartPulse size={23} strokeWidth={2.5} /></div>
          <div><p className="font-bold tracking-tight">MediBridge</p><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Hospital management</p></div>
        </div>
        <div className="relative max-w-xl py-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Join the care network</div>
          <h2 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-[-0.04em] xl:text-5xl">Your care journey, all in one place.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/55">Create an account to connect with your hospital team and access the services you need.</p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><Activity className="mb-3 text-emerald-300" size={19} /><p className="text-sm font-semibold">Simple access</p><p className="mt-1 text-xs text-white/45">Appointments and care updates</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><ShieldCheck className="mb-3 text-sky-300" size={19} /><p className="text-sm font-semibold">Private by design</p><p className="mt-1 text-xs text-white/45">Your account stays protected</p></div>
          </div>
        </div>
        <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/35"><span>Care, connected.</span><span className="flex items-center gap-1.5">MediBridge HMS <ArrowUpRight size={13} /></span></div>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-[480px]">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20 lg:hidden">
            <HeartPulse size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Create your account</h1>
          <p className="text-sm text-ink/50 mt-1">Choose your account type to get started</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface surface-shadow overflow-hidden">
          <EcgDivider />
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-critical-light px-3 py-2.5 text-sm text-critical">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {notice && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
                <CheckCircle2 size={16} />
                {notice}
              </div>
            )}

            <div>
              <Label>Register as</Label>
              <Select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor (approval required)</option>
                <option value="nurse">Nurse (approval required)</option>
                <option value="receptionist">Receptionist (approval required)</option>
                <option value="lab_technician">Lab technician (approval required)</option>
                <option value="pharmacist">Pharmacist (approval required)</option>
                <option value="accountant">Accountant (approval required)</option>
                <option value="admin" disabled>Admin (created by an existing admin)</option>
              </Select>
              <p className="mt-1 text-xs text-ink/50">All accounts stay pending until an administrator approves them.</p>
            </div>

            <div>
              <Label>Full name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                  <Input autoComplete="name" className="pl-9" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
            </div>

            <div>
              <Label>Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                  <Input
                type="email"
                required
                autoComplete="email"
                className="pl-9"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
                </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                <Input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="pl-9"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                  <Input type="tel" autoComplete="tel" className="pl-9" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div>
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" loading={loading} disabled={!!notice}>
              {notice ? 'Request sent' : 'Submit registration'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink/50">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      </main>
    </div>
  );
}
