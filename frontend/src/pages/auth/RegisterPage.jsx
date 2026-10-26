import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import EcgDivider from '@/components/layout/EcgDivider';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-2xl bg-brand p-3 text-white mb-3">
            <HeartPulse size={28} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="text-sm text-ink/50 mt-1">Book appointments and manage your care</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          <EcgDivider />
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-critical-light px-3 py-2.5 text-sm text-critical">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <Label>Full name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <Label>Email address</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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

            <Button type="submit" className="w-full" loading={loading}>
              Create account
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
    </div>
  );
}
