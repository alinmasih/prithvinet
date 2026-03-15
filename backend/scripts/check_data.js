const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI.split('@')[1] || 'DB');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.\n');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('--- DATABASE INVENTORY ---');
    
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`${col.name.padEnd(25)} : ${count} documents`);
      
      if (count > 0 && ['industries', 'stations', 'compliancestatuses', 'monitoringlogs', 'users'].includes(col.name)) {
        const samples = await mongoose.connection.db.collection(col.name).find().limit(1).toArray();
        console.log(`Sample [${col.name}]:`, JSON.stringify(samples[0], (key, value) => 
          key === 'password' || key === 'refreshToken' ? '********' : value, 2), '\n');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err.message);
    process.exit(1);
  }
};

checkData();
