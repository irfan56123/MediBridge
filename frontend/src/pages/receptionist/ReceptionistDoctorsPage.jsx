import { useEffect, useState } from 'react';
import { doctorApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/common/Loading';

export default function ReceptionistDoctorsPage() {
  usePageTitle('Doctors Directory');
  const [doctors, setDoctors] = useState(null);

  useEffect(() => { doctorApi.getAll().then((res) => setDoctors(res.data.data)); }, []);
  if (!doctors) return <PageLoader />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map((doc) => (
        <Card key={doc._id}>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-brand-light flex items-center justify-center font-display font-semibold text-brand-dark">
                {doc.user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-display font-semibold text-ink">Dr. {doc.user?.name}</h3>
                <p className="text-xs text-ink/50">{doc.specialization}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="brand">{doc.department?.name}</Badge>
              <Badge variant={doc.isAvailableForBooking ? 'stable' : 'critical'}>
                {doc.isAvailableForBooking ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-ink/60">
              {doc.availability.length > 0 ? doc.availability.map((a) => a.day.slice(0, 3)).join(', ') : 'No schedule set'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
