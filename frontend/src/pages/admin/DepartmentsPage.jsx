import { useEffect, useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { departmentApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, FormField, Textarea } from '@/components/ui/Input';
import { EmptyState, PageLoader } from '@/components/common/Loading';

export default function DepartmentsPage() {
  usePageTitle('Departments');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = () => {
    setLoading(true);
    departmentApi.getAll().then((res) => {
      setDepartments(res.data.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await departmentApi.create(form);
      toast.success('Department created');
      setModalOpen(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Department</Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : departments.length === 0 ? (
        <EmptyState title="No departments yet" description="Create your first hospital department." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <Card key={d._id}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-light p-2.5 text-brand-dark"><Building2 size={20} /></div>
                  <div>
                    <h3 className="font-display font-semibold text-ink">{d.name}</h3>
                    {d.headOfDepartment && <p className="text-xs text-ink/50">Head: Dr. {d.headOfDepartment?.user?.name}</p>}
                  </div>
                </div>
                {d.description && <p className="mt-3 text-sm text-ink/60">{d.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Department name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <Button type="submit" className="w-full" loading={saving}>Create Department</Button>
        </form>
      </Modal>
    </div>
  );
}
