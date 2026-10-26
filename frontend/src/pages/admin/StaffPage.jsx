import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi, departmentApi } from '@/api/services';
import { usePageTitle } from '@/context/PageTitleContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/common/DataTable';
import { Input, Label, Select, FormField } from '@/components/ui/Input';

const ROLES = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'accountant'];

export default function StaffPage() {
  usePageTitle('Staff Management');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'nurse', phone: '', department: '', specialization: '', consultationFee: '' });

  const load = () => {
    setLoading(true);
    userApi.getAll(roleFilter ? { role: roleFilter } : {}).then((res) => {
      setUsers(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [roleFilter]);

  useEffect(() => {
    departmentApi.getAll().then((res) => setDepartments(res.data.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.create(form);
      toast.success('Staff account created');
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'nurse', phone: '', department: '', specialization: '', consultationFee: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id) => {
    await userApi.toggleActive(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-48">
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </Select>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Staff
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <DataTable
            loading={loading}
            data={users}
            emptyTitle="No staff members"
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: (r) => <Badge status={r.role} variant="brand">{r.role.replace('_', ' ')}</Badge> },
              { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
              { key: 'isActive', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'stable' : 'critical'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <button onClick={() => toggleActive(r._id)} className="text-xs font-medium text-brand hover:underline">
                    {r.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Full name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label="Temporary password">
            <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </Select>
            </FormField>
            <FormField label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
          </div>

          {form.role === 'doctor' && (
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-paper p-3">
              <FormField label="Department">
                <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Specialization">
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
              </FormField>
              <FormField label="Consultation Fee">
                <Input type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
              </FormField>
            </div>
          )}

          <Button type="submit" className="w-full" loading={saving}>Create Account</Button>
        </form>
      </Modal>
    </div>
  );
}
