import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { doctorApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { EmptyState, PageLoader } from '@/components/common/Loading';

export default function AdminDoctorsPage() {
  usePageTitle('Doctors');
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    doctorApi.getAll().then((res) => setDoctors(res.data.data));
  }, []);

  if (!doctors) return <PageLoader />;
  if (doctors.length === 0) return <EmptyState title="No doctors yet" icon={Stethoscope} description="Add doctors from the Staff page." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map((doc) => (
        <Card key={doc._id}>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-brand-light flex items-center justify-center font-display font-semibold text-brand-dark">
                {doc.user?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-ink truncate">Dr. {doc.user?.name}</h3>
                <p className="text-xs text-ink/50 truncate">{doc.specialization || 'General'}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="brand">{doc.department?.name || 'Unassigned'}</Badge>
              <Badge variant={doc.isAvailableForBooking ? 'stable' : 'critical'}>
                {doc.isAvailableForBooking ? 'Accepting patients' : 'Not accepting'}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-ink/60 space-y-1">
              <p>Fee: ৳{doc.consultationFee}</p>
              <p>{doc.yearsOfExperience} years experience</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
