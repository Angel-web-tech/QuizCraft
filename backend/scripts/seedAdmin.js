require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDatabase = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env before provisioning an admin.');
  }
  if (
    ADMIN_EMAIL.trim().toLowerCase() === 'admin@example.com' ||
    ADMIN_PASSWORD === 'replace_with_a_strong_password_of_at_least_12_characters'
  ) {
    throw new Error('Replace the placeholder admin email and password before provisioning an administrator.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  await connectDatabase();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      throw new Error('The configured admin email already belongs to a student. No account was changed.');
    }
    console.log('An admin already exists for that email; password and account were left unchanged.');
    return;
  }

  const anyAdmin = await User.exists({ role: 'admin' });
  if (anyAdmin) {
    throw new Error('An administrator already exists. No duplicate admin was created.');
  }

  await User.create({
    name: ADMIN_NAME.trim(),
    email,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    role: 'admin',
  });
  console.log(`Administrator ${email} was provisioned. The password was not printed.`);
}

seedAdmin()
  .catch((error) => {
    console.error('Unable to provision administrator:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
