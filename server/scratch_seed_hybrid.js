import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';

async function seedHybridUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hybridUser = {
      email: 'hybrid@odc.ma',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Hybrid',
      role: 'member-odc-hybrid',
      isActive: true
    };

    const existing = await User.findOne({ email: hybridUser.email });
    if (existing) {
      console.log('User already exists, updating role...');
      existing.role = 'member-odc-hybrid';
      await existing.save();
    } else {
      await User.create(hybridUser);
      console.log('Test hybrid user created successfully');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding user:', err);
    process.exit(1);
  }
}

seedHybridUser();
