const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const connectDB = require('../config/db');
const { ROLES } = require('./constants');

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run promote-doctor -- user@example.com');
  process.exit(1);
}

const promote = async () => {
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) throw new Error(`No account found for ${email}`);

  let doctor = await Doctor.findOne({ user: user._id });
  if (!doctor) doctor = await Doctor.create({ user: user._id });

  user.role = ROLES.DOCTOR;
  user.profileRef = doctor._id;
  await user.save({ validateBeforeSave: false });

  console.log(`Updated ${user.email} to the doctor role.`);
};

promote()
  .catch((error) => {
    console.error(`Unable to promote account: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
