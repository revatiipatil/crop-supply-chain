const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateUserRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update any users with role 'user' to 'farmer'
    const result = await User.updateMany(
      { role: 'user' },
      { $set: { role: 'farmer' } }
    );

    console.log(`Updated ${result.modifiedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating user roles:', error);
    process.exit(1);
  }
};

updateUserRoles(); 