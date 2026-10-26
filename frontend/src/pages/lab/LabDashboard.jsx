import { useEffect, useState } from 'react';
import { FlaskConical, Clock, CheckCircle2 } from 'lucide-react';
import { labApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import StatCard from '@/components/common/StatCard';
import { PageLoader } from '@/components/common/Loading';

export default function LabDashboard() {
  usePageTitle('Lab Dashboard');
  const [tests, setTests] = useState(null);

  useEffect(() => { labApi.getAll().then((res) => setTests(res.data.data)); }, []);
  if (!tests) return <PageLoader />;

  const pending = tests.filter((t) => ['requested', 'sample_collected', 'in_progress'].includes(t.status)).length;
  const completed = tests.filter((t) => t.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total Tests" value={tests.length} icon={FlaskConical} tone="brand" />
      <StatCard label="Pending" value={pending} icon={Clock} tone="caution" />
      <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="stable" />
    </div>
  );
}
