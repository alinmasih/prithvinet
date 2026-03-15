require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const RegionalOffice = require('../models/RegionalOffice');

const test = async () => {
    try {
        await connectDB();
        console.log('--- Testing RegionalOffice.find() ---');
        const offices = await RegionalOffice.find().select('office_name district _id');
        console.log('Offices found:', JSON.stringify(offices, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

test();
