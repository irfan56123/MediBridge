import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { EmptyState, PageLoader } from '@/components/common/Loading';

export default function PatientDoctorsPage() {
  usePageTitle('Find a Doctor');
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    doctorApi.getAll()
      .then((res) => setDoctors(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not load doctors'));
  }, []);

  if (!doctors) return <PageLoader />;
  if (doctors.length === 0) return <EmptyState title="No doctors available right now" icon={Stethoscope} description="Please check again later or contact the reception desk." />;

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-ink">Choose your doctor</h2><p className="mt-1 text-sm text-ink/55">Browse available specialists and request a consultation.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor._id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="h-1 bg-gradient-to-r from-brand via-cyan-500 to-sky-400" />
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-light text-lg font-bold text-brand-dark"><Stethoscope size={20} /></div>
                <div className="min-w-0"><h3 className="truncate font-bold text-ink">Dr. {doctor.user?.name}</h3><p className="truncate text-sm text-ink/55">{doctor.specialization || 'General physician'}</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2"><Badge variant="brand">{doctor.department?.name || 'General care'}</Badge><Badge variant="stable">Available for booking</Badge></div>
              <div className="mt-4 space-y-2 border-t border-border/70 pt-4 text-sm text-ink/60">
                <p>{doctor.yearsOfExperience || 0} years of experience</p>
                {doctor.qualifications?.length > 0 && <p className="line-clamp-2">{doctor.qualifications.join(', ')}</p>}
                <p className="font-semibold text-ink">Consultation fee: ৳{Number(doctor.consultationFee || 0).toLocaleString()}</p>
              </div>
              <Button className="mt-5 w-full" onClick={() => navigate('/patient/appointments', { state: { doctorId: doctor._id } })}><CalendarPlus size={16} /> Book consultation</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
