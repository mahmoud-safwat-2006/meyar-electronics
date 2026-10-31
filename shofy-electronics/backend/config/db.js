const mongoose = require('mongoose');
const { secret } = require('./secret');

mongoose.set('strictQuery', false);

// Default fallback database URI for Meyar Electronics
const MONGO_URI = secret.db_url || 'mongodb://127.0.0.1:27017/meyar_electronics';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully to Meyar Electronics database!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

module.exports = connectDB;