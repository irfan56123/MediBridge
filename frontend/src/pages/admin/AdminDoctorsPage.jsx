import { useEffect, useState } from 'react';
import { Stethoscope, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi, userApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { EmptyState, PageLoader } from '@/components/common/Loading';

const loadDoctors = (setDoctors) => doctorApi.getAll().then((res) => setDoctors(res.data.data));

export default function AdminDoctorsPage() {
  usePageTitle('Doctors');
  const [doctors, setDoctors] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => { loadDoctors(setDoctors); }, []);

  const approveDoctor = async (doctor) => {
    setApprovingId(doctor.user?._id);
    try {
      await userApi.toggleActive(doctor.user._id);
      setDoctors((current) => current.map((item) => item._id === doctor._id
        ? { ...item, user: { ...item.user, isActive: true } }
        : item));
      toast.success('Doctor account approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve doctor');
    } finally {
      setApprovingId(null);
    }
  };

  if (!doctors) return <PageLoader />;
  if (doctors.length === 0) return <EmptyState title="No doctors yet" icon={Stethoscope} description="Doctor registrations and staff accounts will appear here." />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doc) => (
        <Card key={doc._id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div className="h-1 bg-gradient-to-r from-brand via-cyan-500 to-sky-400" />
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-light text-lg font-bold text-brand-dark">
                {doc.user?.name?.charAt(0)?.toUpperCase() || <Stethoscope size={20} />}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-ink">Dr. {doc.user?.name}</h3>
                <p className="truncate text-xs text-ink/50">{doc.specialization || 'General'}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="brand">{doc.department?.name || 'Unassigned'}</Badge>
              <Badge variant={doc.user?.isActive ? 'stable' : 'caution'}>{doc.user?.isActive ? 'Approved' : 'Pending approval'}</Badge>
            </div>

            <div className="mt-4 space-y-2 border-t border-border/70 pt-4 text-xs text-ink/60">
              {doc.user?.email && <p className="truncate">{doc.user.email}</p>}
              {doc.user?.phone && <p>{doc.user.phone}</p>}
              <div className="flex items-center justify-between pt-1">
                <span>{doc.yearsOfExperience || 0} years experience</span>
                <Badge variant={doc.isAvailableForBooking ? 'stable' : 'neutral'}>{doc.isAvailableForBooking ? 'Accepting patients' : 'Not accepting'}</Badge>
              </div>
              <p className="font-semibold text-ink">Consultation fee: ৳{Number(doc.consultationFee || 0).toLocaleString()}</p>
            </div>

            {!doc.user?.isActive && (
              <Button className="mt-4 w-full" loading={approvingId === doc.user?._id} onClick={() => approveDoctor(doc)}>
                <UserCheck size={16} /> Approve doctor
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
