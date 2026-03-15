const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const RegionalOffice = require('./models/RegionalOffice');
const MonitoringTeam = require('./models/MonitoringTeam');
const MonitoringStation = require('./models/MonitoringStation');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyData = async () => {
  try {
    await connectDB();
    console.log('--- DATABASE VERIFICATION REPORT ---');

    const officeCount = await RegionalOffice.countDocuments();
    console.log('Total Regional Offices:', officeCount);

    const teamCount = await MonitoringTeam.countDocuments();
    console.log('Total Monitoring Teams:', teamCount);

    const stationCount = await MonitoringStation.countDocuments({ 
      stationType: { $in: ['Head Office', 'Regional Office'] } 
    });
    console.log('Total CECB Offices in Stations Grid:', stationCount);

    const users = await User.find({ role: 'Regional Officer' }).select('name email region_district');
    console.log('Regional Officer Accounts:', users.length);

    console.log('------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
};

verifyData();
