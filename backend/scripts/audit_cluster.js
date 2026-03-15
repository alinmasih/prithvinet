const mongoose = require('mongoose');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    console.log('--- DATABASES ---');
    console.log(databases.map(db => db.name).join(', '));

    const dbNames = databases.map(db => db.name).filter(name => name !== 'admin' && name !== 'local' && name !== 'config');

    for (const dbName of dbNames) {
      console.log(`\n--- DATABASE: ${dbName} ---`);
      const db = mongoose.connection.useDb(dbName);
      const collections = await db.db.listCollections().toArray();
      for (const col of collections) {
         const count = await db.db.collection(col.name).countDocuments();
         console.log(`${col.name.padEnd(20)}: ${count}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

checkData();
