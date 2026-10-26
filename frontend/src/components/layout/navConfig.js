import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
  BedDouble,
  Receipt,
  Building2,
  UserCircle,
  ClipboardList,
  HeartPulse,
} from 'lucide-react';

export const navConfig = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Staff', to: '/admin/staff', icon: Users },
    { label: 'Departments', to: '/admin/departments', icon: Building2 },
    { label: 'Doctors', to: '/admin/doctors', icon: Stethoscope },
    { label: 'Patients', to: '/admin/patients', icon: UserCircle },
    { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
    { label: 'Wards & Beds', to: '/admin/wards', icon: BedDouble },
    { label: 'Pharmacy', to: '/admin/pharmacy', icon: Pill },
    { label: 'Billing', to: '/admin/billing', icon: Receipt },
  ],
  doctor: [
    { label: 'Dashboard', to: '/doctor', icon: LayoutDashboard },
    { label: 'Appointments', to: '/doctor/appointments', icon: CalendarDays },
    { label: 'My Patients', to: '/doctor/patients', icon: UserCircle },
    { label: 'Prescriptions', to: '/doctor/prescriptions', icon: FileText },
    { label: 'Lab Requests', to: '/doctor/lab', icon: FlaskConical },
    { label: 'Availability', to: '/doctor/availability', icon: ClipboardList },
  ],
  nurse: [
    { label: 'Dashboard', to: '/nurse', icon: LayoutDashboard },
    { label: 'Wards & Beds', to: '/nurse/wards', icon: BedDouble },
    { label: 'Patients', to: '/nurse/patients', icon: HeartPulse },
  ],
  receptionist: [
    { label: 'Dashboard', to: '/receptionist', icon: LayoutDashboard },
    { label: 'Appointments', to: '/receptionist/appointments', icon: CalendarDays },
    { label: 'Patients', to: '/receptionist/patients', icon: UserCircle },
    { label: 'Doctors', to: '/receptionist/doctors', icon: Stethoscope },
  ],
  pharmacist: [
    { label: 'Dashboard', to: '/pharmacist', icon: LayoutDashboard },
    { label: 'Inventory', to: '/pharmacist/inventory', icon: Pill },
    { label: 'Prescriptions', to: '/pharmacist/prescriptions', icon: FileText },
  ],
  lab_technician: [
    { label: 'Dashboard', to: '/lab', icon: LayoutDashboard },
    { label: 'Test Queue', to: '/lab/tests', icon: FlaskConical },
  ],
  accountant: [
    { label: 'Dashboard', to: '/accountant', icon: LayoutDashboard },
    { label: 'Invoices', to: '/accountant/invoices', icon: Receipt },
  ],
  patient: [
    { label: 'Dashboard', to: '/patient', icon: LayoutDashboard },
    { label: 'Appointments', to: '/patient/appointments', icon: CalendarDays },
    { label: 'Medical History', to: '/patient/history', icon: FileText },
    { label: 'Prescriptions', to: '/patient/prescriptions', icon: Pill },
    { label: 'Lab Reports', to: '/patient/lab', icon: FlaskConical },
    { label: 'Billing', to: '/patient/billing', icon: Receipt },
  ],
};

export const roleLabels = {
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  receptionist: 'Receptionist',
  pharmacist: 'Pharmacist',
  lab_technician: 'Lab Technician',
  accountant: 'Accountant',
  patient: 'Patient',
};
