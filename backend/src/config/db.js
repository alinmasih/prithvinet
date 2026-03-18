const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`📡 Database System: MongoDB Connected: ${conn.connection.host}`);
    console.log('📡 Database System: Supabase (PostgreSQL) is secondary.');
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Warning: ${error.message}`);
    // Do not exit, allow server to start so Supabase can still be used
  }
};

module.exports = connectDB;
