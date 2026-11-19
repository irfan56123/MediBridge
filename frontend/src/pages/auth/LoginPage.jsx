import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeartPulse, Mail, Lock, AlertCircle, ShieldCheck, Activity, ArrowUpRight } from "lucide-react";
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
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#142b3b] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-28 -top-24 h-[430px] w-[430px] rounded-full border border-white/[0.08]" />
        <div className="absolute -right-8 -top-4 h-[300px] w-[300px] rounded-full border border-white/[0.08]" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-black/20"><HeartPulse size={23} strokeWidth={2.5} /></div>
          <div><p className="font-bold tracking-tight">MediBridge</p><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Hospital management</p></div>
        </div>
        <div className="relative max-w-xl py-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> One connected care team</div>
          <h2 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-[-0.04em] xl:text-5xl">Better care starts with a clearer view.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/55">A secure workspace for your appointments, patient records and hospital operations.</p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><Activity className="mb-3 text-emerald-300" size={19} /><p className="text-sm font-semibold">Connected workflows</p><p className="mt-1 text-xs text-white/45">The right information, in one place</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><ShieldCheck className="mb-3 text-sky-300" size={19} /><p className="text-sm font-semibold">Role based access</p><p className="mt-1 text-xs text-white/45">Secure access for every care role</p></div>
          </div>
        </div>
        <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/35"><span>Care, connected.</span><span className="flex items-center gap-1.5">MediBridge HMS <ArrowUpRight size={13} /></span></div>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-[430px]">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20 lg:hidden">
            <HeartPulse size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="text-sm text-ink/50 mt-1">
            Sign in to your MediBridge account
          </p>
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
                  autoComplete="username"
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
                  autoComplete="current-password"
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
          New User?{" "}
          <Link
            to="/register"
            className="font-medium text-brand hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
      </main>
    </div>
  );
}
