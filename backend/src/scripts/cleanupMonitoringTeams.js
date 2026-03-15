require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const MonitoringTeam = require('../models/MonitoringTeam');
const MonitoringLog = require('../models/MonitoringLog');
const PollutionReading = require('../models/PollutionReading');
const InspectionLog = require('../models/InspectionLog');
const Alert = require('../models/Alert');

const cleanup = async () => {
    try {
        await connectDB();
        console.log('--- Cleanup Started ---');

        // 1. Identify all users with role 'Monitoring Team'
        const monitoringUsers = await User.find({ role: 'Monitoring Team' });
        const userIds = monitoringUsers.map(u => u._id);
        console.log(`Found ${userIds.length} users with 'Monitoring Team' role.`);

        // 2. Delete all MonitoringTeam documents
        const mtDelete = await MonitoringTeam.deleteMany({});
        console.log(`Deleted ${mtDelete.deletedCount} MonitoringTeam documents.`);

        // 3. Delete PollutionReadings submitted by these users
        const prDelete = await PollutionReading.deleteMany({ submittedBy: { $in: userIds } });
        console.log(`Deleted ${prDelete.deletedCount} PollutionReading documents.`);

        // 4. Delete MonitoringLogs submitted by these users
        const mlDelete = await MonitoringLog.deleteMany({ submitted_by: { $in: userIds } });
        console.log(`Deleted ${mlDelete.deletedCount} MonitoringLog documents.`);

        // 5. Delete InspectionLogs where these users were inspectors
        const ilDelete = await InspectionLog.deleteMany({ inspector: { $in: userIds } });
        console.log(`Deleted ${ilDelete.deletedCount} InspectionLog documents.`);

        // 6. Delete Alerts assigned to these users
        const alDelete = await Alert.deleteMany({ assigned_officer: { $in: userIds } });
        console.log(`Deleted ${alDelete.deletedCount} Alert documents.`);

        // 7. Delete the Users themselves
        const userDelete = await User.deleteMany({ _id: { $in: userIds } });
        console.log(`Deleted ${userDelete.deletedCount} User documents.`);

        console.log('--- Cleanup Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanup();
