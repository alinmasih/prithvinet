const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const collections = ['industries', 'stations', 'compliancestatuses', 'monitoringlogs', 'users'];
    
    for (const colName of collections) {
      const count = await mongoose.connection.db.collection(colName).countDocuments();
      console.log(`${colName}: ${count}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

checkData();
