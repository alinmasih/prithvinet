const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const RegionalOffice = require('./models/RegionalOffice');
const MonitoringTeam = require('./models/MonitoringTeam');
const MonitoringStation = require('./models/MonitoringStation');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const officesData = [
  {
    name: 'CECB Head Office',
    location: 'Nava Raipur',
    district: 'Raipur',
    lat: 21.2133,
    lng: 81.7618,
    address: 'Paryavas Bhavan, North Block, Sector-19, Nava Raipur Atal Nagar',
    head: 'Member Secretary',
    phone: '0771-2512220'
  },
  {
    name: 'Raipur Regional Office',
    location: 'Tatibandh',
    district: 'Raipur',
    lat: 21.2619,
    lng: 81.5959,
    address: 'New Office Building, Ring Road No. 2, Tatibandh, Raipur',
    head: 'Regional Officer (Raipur)',
    phone: '0771-2573897'
  },
  {
    name: 'Bilaspur Regional Office',
    location: 'Vyapar Vihar',
    district: 'Bilaspur',
    lat: 22.0797,
    lng: 82.1391,
    address: 'Vyapar Vihar, Near Pt. Deendayal Upadhyay Park, Bilaspur',
    head: 'Regional Officer (Bilaspur)',
    phone: '07752-261172'
  },
  {
    name: 'Durg-Bhilai Regional Office',
    location: 'Bhilai',
    district: 'Durg',
    lat: 21.1938,
    lng: 81.3509,
    address: 'Bungalow No. 5/32, Bhilai',
    head: 'Regional Officer (Durg)',
    phone: '0788-2242964'
  },
  {
    name: 'Korba Regional Office',
    location: 'Rampur',
    district: 'Korba',
    lat: 22.3595,
    lng: 82.7501,
    address: 'Near Tehsil Office Rampur, H.I.G. 21 and 22, Korba',
    head: 'Regional Officer (Korba)',
    phone: '07759-222370'
  },
  {
    name: 'Raigarh Regional Office',
    location: 'TV Tower Road',
    district: 'Raigarh',
    lat: 21.8974,
    lng: 83.3950,
    address: 'T.V. Tower Road, Raigarh',
    head: 'Regional Officer (Raigarh)',
    phone: '07762-226569'
  },
  {
    name: 'Ambikapur Regional Office',
    location: 'Namnakala',
    district: 'Surguja',
    lat: 23.1235,
    lng: 83.1843,
    address: 'Bajrang Bhawan, Namnakala, Ambikapur',
    head: 'Regional Officer (Ambikapur)',
    phone: '07774-236438'
  },
  {
    name: 'Jagdalpur Regional Office',
    location: 'Aghanpur Colony',
    district: 'Bastar',
    lat: 19.0762,
    lng: 82.0294,
    address: 'H.I.G. 5, Aghanpur Colony, Dharampura, Jagdalpur',
    head: 'Regional Officer (Jagdalpur)',
    phone: '07782-229367'
  }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Seeding...');

    for (const data of officesData) {
      // 1. Create Regional Office
      const office = await RegionalOffice.findOneAndUpdate(
        { office_name: data.name },
        {
          office_name: data.name,
          district: data.district,
          address: data.address,
          office_head: data.head,
          phone: data.phone
        },
        { upsert: true, new: true }
      );
      console.log(`Office ${data.name} synced.`);

      // 2. Create Regional Officer User
      const roEmail = `ro.${data.district.toLowerCase()}@cecb.gov.in`;
      const roUser = await User.findOneAndUpdate(
        { email: roEmail },
        {
          name: data.head,
          email: roEmail,
          password: 'Password@123',
          role: 'Regional Officer',
          assigned_region: office._id,
          region_district: data.district,
          status: 'Active',
          approved_status: true
        },
        { upsert: true, new: true }
      );

      // 3. Create Monitoring Team User
      const teamEmail = `mt.${data.district.toLowerCase()}@cecb.gov.in`;
      const teamUser = await User.findOneAndUpdate(
        { email: teamEmail },
        {
          name: `Monitoring Team - ${data.district}`,
          email: teamEmail,
          password: 'Password@123',
          role: 'Monitoring Team',
          status: 'Active',
          approved_status: true
        },
        { upsert: true, new: true }
      );

      // 4. Create/Sync MonitoringTeam (operational group)
      await MonitoringTeam.findOneAndUpdate(
        { team_name: `Unit ${data.district}` },
        {
          team_name: `Unit ${data.district}`,
          regional_officer_id: roUser._id,
          members: [teamUser._id],
          status: 'Active'
        },
        { upsert: true }
      );

      // 5. Create/Sync MonitoringStation (for Geo-map and UI visibility)
      const stationType = data.name.includes('Head') ? 'Head Office' : 'Regional Office';
      await MonitoringStation.findOneAndUpdate(
        { iotDeviceId: `CECB-RO-${data.district.toUpperCase()}` },
        {
          stationName: data.name,
          stationType: stationType,
          regionalOffice: data.district,
          latitude: data.lat,
          longitude: data.lng,
          address: data.address,
          phone: data.phone,
          installationDate: new Date('1970-01-01'),
          sensorType: 'Official',
          iotDeviceId: `CECB-RO-${data.district.toUpperCase()}`,
          status: 'Active'
        },
        { upsert: true }
      );
    }

    console.log('Seeding completed successfully.');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
