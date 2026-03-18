require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const MonitoringStation = require('../models/MonitoringStation');
const RegionalOffice = require('../models/RegionalOffice');

const seedStations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const offices = await RegionalOffice.find({});
        console.log(`Found ${offices.length} offices. Seeding stations...`);

        const stationTypes = ['Air Quality', 'Water Quality', 'Noise Monitoring', 'Regional Office'];
        
        for (const office of offices) {
            const cityName = office.office_name.split(' ')[0];
            
            // Create a station for each type for each office to make it look dense
            for (const type of stationTypes) {
                const deviceId = `STN-${cityName.toUpperCase()}-${type.split(' ')[0].toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
                
                const stationData = {
                    stationName: `${cityName} ${type} Unit`,
                    stationType: type,
                    regionalOffice: office.office_name,
                    latitude: office.location?.coordinates[1] || (21 + Math.random()),
                    longitude: office.location?.coordinates[0] || (81 + Math.random()),
                    parameters: type === 'Air Quality' ? ['PM2.5', 'PM10', 'SO2'] : 
                                type === 'Water Quality' ? ['Water PH', 'Water DO'] : 
                                ['Noise'],
                    installationDate: new Date(),
                    sensorType: 'Advanced Digital Sensor',
                    iotDeviceId: deviceId,
                    status: 'Active',
                    address: office.address,
                    phone: office.phone
                };

                await MonitoringStation.findOneAndUpdate(
                    { iotDeviceId: deviceId },
                    stationData,
                    { upsert: true, new: true }
                );
                console.log(`Seeded station: ${stationData.stationName}`);
            }
        }

        console.log('Monitoring Stations seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedStations();
