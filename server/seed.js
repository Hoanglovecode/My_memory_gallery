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

    // 2. Seed 'bangaituonglai' / '00000000'
    const userExists = await User.findOne({ username: 'bangaituonglai' });
    if (!userExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('00000000', salt);
      const user = new User({
        username: 'bangaituonglai',
        password: hashedPassword
      });
      await user.save();
      console.log('Successfully seeded bangaituonglai / 00000000');
    } else {
      console.log('User bangaituonglai already exists.');
    }

    // 3. Seed 'levanhoang' / '10052007'
    const levanhoangExists = await User.findOne({ username: 'levanhoang' });
    if (!levanhoangExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('10052007', salt);
      const user = new User({
        username: 'levanhoang',
        password: hashedPassword
      });
      await user.save();
      console.log('Successfully seeded levanhoang / 10052007');
    } else {
      // If it exists, update it to the desired password 10052007
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('10052007', salt);
      levanhoangExists.password = hashedPassword;
      await levanhoangExists.save();
      console.log('Successfully updated password for levanhoang to 10052007');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err.message);
    process.exit(1);
  }
}

seedAdmin();
