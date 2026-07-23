import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../src/models/User';

dotenv.config();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentify';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin user already exists:', email);
    } else {
      existing.role = 'admin';
      existing.passwordHash = await bcrypt.hash(password, 12);
      await existing.save();
      console.log('Upgraded existing user to admin:', email);
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      name: 'Admin',
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
    });
    console.log('Admin user created:', email);
  }

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
