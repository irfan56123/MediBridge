import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeartPulse, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import EcgDivider from "@/components/layout/EcgDivider";

const roleHome = {
  admin: "/admin",
  doctor: "/doctor",
  nurse: "/nurse",
  receptionist: "/receptionist",
  pharmacist: "/pharmacist",
  lab_technician: "/lab",
  accountant: "/accountant",
  patient: "/patient",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(roleHome[data.role] || "/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-2xl bg-brand p-3 text-white mb-3">
            <HeartPulse size={28} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            MediBridge HMS
          </h1>
          <p className="text-sm text-ink/50 mt-1">
            Sign in to your hospital account
          </p>
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
              <Label>Email address</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30"
                  size={16}
                />
                <Input
                  type="email"
                  required
                  className="pl-9"
                  placeholder="you@hospital.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30"
                  size={16}
                />
                <Input
                  type="password"
                  required
                  className="pl-9"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink/50">
          New patient?{" "}
          <Link
            to="/register"
            className="font-medium text-brand hover:underline"
          >
            Create a patient account
          </Link>
        </p>
      </div>
    </div>
  );
}
