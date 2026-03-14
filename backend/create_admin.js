const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const adminExists = await User.findOne({ email: 'admin@ganpati.com' });
    if (adminExists) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const admin = new User({
      username: 'admin',
      email: 'admin@ganpati.com',
      password: 'password123', // This will be hashed by the pre-save hook
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@ganpati.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
