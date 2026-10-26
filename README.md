# MediBridge HMS — Hospital Management System

A full-stack Hospital Management System built with the MERN stack (MongoDB, Express, React, Node.js), built as a university final year project.

## Features

- **8 role-based dashboards**: Admin, Doctor, Nurse, Receptionist, Pharmacist, Lab Technician, Accountant, Patient
- JWT authentication with role-based access control (RBAC)
- Appointment scheduling engine with automatic slot generation & double-booking prevention
- Electronic Health Records (EHR) — visit notes, diagnoses, treatment plans
- E-prescriptions with pharmacy inventory deduction on dispense
- Pharmacy inventory management with low-stock alerts
- Lab test request → sample collection → results workflow
- Ward & bed management with patient admission/discharge
- Billing & invoicing with itemized charges and payment tracking
- Admin analytics dashboard with live charts (appointment trends, revenue, occupancy)

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- **Frontend**: React (Vite), Tailwind CSS v4, React Router, Recharts, Axios, Lucide icons

## Project Structure

```
hms-project/
├── backend/
│   ├── config/       # DB connection
│   ├── controllers/  # Route handler logic
│   ├── middleware/   # Auth & error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── utils/        # Constants, JWT helper, seed script
│   └── server.js
└── frontend/
    └── src/
        ├── api/            # Axios instance + API service functions
        ├── components/     # UI, layout, and common components
        ├── context/        # Auth & page title context
        ├── pages/          # Pages grouped by role
        └── routes/         # Protected route wrapper
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET at minimum
npm run seed     # populates demo data & accounts for all 8 roles
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

The frontend dev server proxies `/api` requests to `http://localhost:5000`, so both must be running together.

### Demo Login Credentials (after running `npm run seed`)

| Role           | Email              | Password      |
| -------------- | ------------------ | ------------- |
| Admin          | admin@hms.com      | Admin@123     |
| Doctor         | doctor@hms.com     | Doctor@123    |
| Nurse          | nurse@hms.com      | Nurse@123     |
| Receptionist   | reception@hms.com  | Reception@123 |
| Pharmacist     | pharmacist@hms.com | Pharma@123    |
| Lab Technician | labtech@hms.com    | LabTech@123   |
| Accountant     | accountant@hms.com | Account@123   |
| Patient        | patient@hms.com    | Patient@123   |

## Suggested Demo Flow for Defense

1. Login as **Receptionist** → register a new patient → book an appointment with the seeded doctor
2. Login as **Doctor** → view today's schedule → record a visit (diagnosis) → write a prescription → request a lab test
3. Login as **Pharmacist** → dispense the prescription (watch inventory deduct)
4. Login as **Lab Technician** → collect sample → enter results
5. Login as **Nurse** → admit the patient to a ward bed
6. Login as **Accountant** → create an invoice for the visit → record payment
7. Login as **Admin** → view the live dashboard reflecting all of the above
8. Login as **Patient** → view appointment, prescription, lab report, and invoice — all from the patient's own portal

## Notes for Your Report

- Password hashing: bcrypt with salt rounds
- Auth: stateless JWT (7-day expiry, configurable)
- Data integrity: Mongoose schema validation + slot-conflict checking at the appointment-booking layer
- Inventory consistency: prescription dispensing atomically deducts stock, with an insufficient-stock guard
