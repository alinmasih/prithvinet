const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

checkData();
