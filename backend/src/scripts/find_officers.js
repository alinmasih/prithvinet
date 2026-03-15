require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const RegionalOffice = require('../models/RegionalOffice');

async function findData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const officers = await User.find({ role: 'Regional Officer' }, 'name email _id assigned_region');
        const offices = await RegionalOffice.find({}, 'office_name _id');
        console.log('OFFICERS:', JSON.stringify(officers, null, 2));
        console.log('OFFICES:', JSON.stringify(offices, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findData();
