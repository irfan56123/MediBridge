const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);


require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const Ward = require('../models/Ward');
const Bed = require('../models/Bed');
const Medicine = require('../models/Medicine');
const { ROLES } = require('./constants');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Doctor.deleteMany(),
    Patient.deleteMany(),
    Department.deleteMany(),
    Ward.deleteMany(),
    Bed.deleteMany(),
    Medicine.deleteMany(),
  ]);

  console.log('Creating departments...');
  const cardiology = await Department.create({ name: 'Cardiology', description: 'Heart & cardiovascular care' });
  const generalMed = await Department.create({ name: 'General Medicine', description: 'Primary care' });
  const pediatrics = await Department.create({ name: 'Pediatrics', description: 'Child healthcare' });

  console.log('Creating admin...');
  await User.create({
    name: 'System Admin',
    email: 'admin@hms.com',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    phone: '0100000000',
  });

  console.log('Creating doctors...');
  const doctorUser1 = await User.create({
    name: 'Dr. Sarah Ahmed',
    email: 'doctor@hms.com',
    password: 'Doctor@123',
    role: ROLES.DOCTOR,
    phone: '0100000001',
    gender: 'female',
  });
  const doctorProfile1 = await Doctor.create({
    user: doctorUser1._id,
    department: cardiology._id,
    specialization: 'Cardiologist',
    licenseNumber: 'LIC-1001',
    consultationFee: 1000,
    yearsOfExperience: 8,
    availability: [
      { day: 'monday', startTime: '09:00', endTime: '15:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '15:00' },
      { day: 'friday', startTime: '09:00', endTime: '13:00' },
    ],
  });
  doctorUser1.profileRef = doctorProfile1._id;
  await doctorUser1.save();

  console.log('Creating nurse, receptionist, pharmacist, lab tech, accountant...');
  await User.create({ name: 'Nurse Fatima', email: 'nurse@hms.com', password: 'Nurse@123', role: ROLES.NURSE });
  await User.create({ name: 'Reception Desk', email: 'reception@hms.com', password: 'Reception@123', role: ROLES.RECEPTIONIST });
  await User.create({ name: 'Pharmacist Karim', email: 'pharmacist@hms.com', password: 'Pharma@123', role: ROLES.PHARMACIST });
  await User.create({ name: 'Lab Tech Rina', email: 'labtech@hms.com', password: 'LabTech@123', role: ROLES.LAB_TECHNICIAN });
  await User.create({ name: 'Accountant Jamal', email: 'accountant@hms.com', password: 'Account@123', role: ROLES.ACCOUNTANT });

  console.log('Creating patient...');
  const patientUser = await User.create({
    name: 'John Patient',
    email: 'patient@hms.com',
    password: 'Patient@123',
    role: ROLES.PATIENT,
    phone: '0100000099',
    gender: 'male',
  });
  const patientProfile = await Patient.create({
    user: patientUser._id,
    bloodGroup: 'O+',
    assignedDoctor: doctorProfile1._id,
  });
  patientUser.profileRef = patientProfile._id;
  await patientUser.save();

  console.log('Creating wards & beds...');
  const generalWard = await Ward.create({ name: 'General Ward A', type: 'general', floor: '1', chargePerDay: 500 });
  await Bed.insertMany([
    { ward: generalWard._id, bedNumber: 'A1' },
    { ward: generalWard._id, bedNumber: 'A2' },
    { ward: generalWard._id, bedNumber: 'A3' },
  ]);
  generalWard.totalBeds = 3;
  await generalWard.save();

  console.log('Creating medicine inventory...');
  await Medicine.insertMany([
    { name: 'Paracetamol', genericName: 'Acetaminophen', category: 'Painkiller', unit: 'tablet', stockQuantity: 500, unitPrice: 2, reorderLevel: 50 },
    { name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Antibiotic', unit: 'capsule', stockQuantity: 200, unitPrice: 5, reorderLevel: 30 },
    { name: 'Cetirizine', genericName: 'Cetirizine HCl', category: 'Antihistamine', unit: 'tablet', stockQuantity: 15, unitPrice: 3, reorderLevel: 20 },
  ]);

  console.log('\n✅ Seed complete! Demo login credentials:');
  console.log('  Admin:        admin@hms.com / Admin@123');
  console.log('  Doctor:       doctor@hms.com / Doctor@123');
  console.log('  Nurse:        nurse@hms.com / Nurse@123');
  console.log('  Receptionist: reception@hms.com / Reception@123');
  console.log('  Pharmacist:   pharmacist@hms.com / Pharma@123');
  console.log('  Lab Tech:     labtech@hms.com / LabTech@123');
  console.log('  Accountant:   accountant@hms.com / Account@123');
  console.log('  Patient:      patient@hms.com / Patient@123');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
