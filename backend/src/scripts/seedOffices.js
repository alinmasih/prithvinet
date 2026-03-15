require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const RegionalOffice = require('../models/RegionalOffice');

const offices = [
  {
    office_name: 'Raipur',
    district: 'Raipur',
    address: 'New Office Building, Ring Road No.-2, Tatibandh, Raipur',
    office_head: 'Regional Officer',
    phone: '0771-2573897'
  },
  {
    office_name: 'Bilaspur',
    district: 'Bilaspur',
    address: 'Vyapar Vihar, Near Pt. Deendayal Upadhyay Garden, Bilaspur',
    office_head: 'Regional Officer',
    phone: '07752-261172'
  },
  {
    office_name: 'Bhilai-Durg',
    district: 'Durg',
    address: 'Bungalow No. 5, 32 Bungalow, Bhilai',
    office_head: 'Regional Officer',
    phone: '0788-2242964'
  },
  {
    office_name: 'Korba',
    district: 'Korba',
    address: 'H.I.G. 21 & 22, Near Tehsil Office, Rampur, Korba',
    office_head: 'Regional Officer',
    phone: '07759-222370'
  },
  {
    office_name: 'Raigarh',
    district: 'Raigarh',
    address: 'T.V. Tower Road, Raigarh',
    office_head: 'Regional Officer',
    phone: '07762-226569'
  },
  {
    office_name: 'Jagdalpur',
    district: 'Bastar',
    address: 'H.I.G. 5, Aghanpur Colony, Dharampura, Jagdalpur',
    office_head: 'Regional Officer',
    phone: '07782-229367'
  },
  {
    office_name: 'Ambikapur',
    district: 'Surguja',
    address: 'Bajrang Bhawan, Namnakala, Ambikapur',
    office_head: 'Regional Officer',
    phone: '07774-236438'
  }
];

const seedOffices = async () => {
    try {
        await connectDB();
        console.log('--- Seeding Regional Offices ---');

        for (const office of offices) {
            await RegionalOffice.findOneAndUpdate(
                { office_name: office.office_name },
                office,
                { upsert: true, new: true }
            );
            console.log(`Seeded: ${office.office_name}`);
        }

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedOffices();
