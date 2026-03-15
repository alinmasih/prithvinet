require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const MonitoringTeam = require('../models/MonitoringTeam');

const verify = async () => {
    try {
        await connectDB();
        console.log('--- Verification Started ---');

        const monitoringUsersCount = await User.countDocuments({ role: 'Monitoring Team' });
        const mtCount = await MonitoringTeam.countDocuments({});

        console.log(`Monitoring Team Users: ${monitoringUsersCount}`);
        console.log(`Monitoring Team Documents: ${mtCount}`);

        if (monitoringUsersCount === 0 && mtCount === 0) {
            console.log('Verification Success: All monitoring team data removed.');
        } else {
            console.log('Verification Failure: Data still exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verify();
