const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

async function seedAdmin() {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed 'admin' / 'love123'
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('love123', salt);
      const admin = new User({
        username: 'admin',
        password: hashedPassword
      });
      await admin.save();
      console.log('Successfully seeded admin / love123');
    } else {
      console.log('User admin already exists.');
    }

    // 2. Seed 'hoangngoclan' / '19012007'
    const userExists = await User.findOne({ username: 'hoangngoclan' });
    if (!userExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('19012007', salt);
      const user = new User({
        username: 'hoangngoclan',
        password: hashedPassword
      });
      await user.save();
      console.log('Successfully seeded hoangngoclan / 19012007');
    } else {
      console.log('User hoangngoclan already exists.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err.message);
    process.exit(1);
  }
}

seedAdmin();
