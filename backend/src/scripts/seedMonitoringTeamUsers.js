require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const RegionalOffice = require('../models/RegionalOffice');
const MonitoringTeam = require('../models/MonitoringTeam');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const offices = await RegionalOffice.find({});
        console.log(`Found ${offices.length} offices`);

        const credentials = [];

        for (const office of offices) {
            const cityName = office.office_name.split(' ')[0].toLowerCase();
            
            // 1. Create Regional Officer if not exists
            const officerEmail = `officer.${cityName}@prithvinet.org`;
            let officer = await User.findOne({ email: officerEmail });
            
            if (!officer) {
                officer = await User.create({
                    name: `Officer ${office.office_name}`,
                    email: officerEmail,
                    password: 'password123', // Will be hashed by pre-save hook
                    role: 'Regional Officer',
                    assigned_region: office._id,
                    approved_status: true
                });
                console.log(`Created officer: ${officerEmail}`);
            }
            credentials.push({ role: 'Regional Officer', email: officerEmail, password: 'password123', office: office.office_name });

            // 2. Create 2 Monitoring Team Users
            const teamMembers = [];
            for (let i = 1; i <= 2; i++) {
                const teamEmail = `team.${cityName}.${i}@prithvinet.org`;
                let teamUser = await User.findOne({ email: teamEmail });
                
                if (!teamUser) {
                    teamUser = await User.create({
                        name: `${office.office_name} Monitor ${i}`,
                        email: teamEmail,
                        password: 'password123',
                        role: 'Monitoring Team',
                        assigned_region: office._id,
                        approved_status: true
                    });
                    console.log(`Created team user: ${teamEmail}`);
                }
                teamMembers.push(teamUser._id);
                credentials.push({ role: 'Monitoring Team', email: teamEmail, password: 'password123', office: office.office_name });
            }

            // 3. Create Monitoring Team Document
            const teamName = `${office.office_name} Monitoring Unit`;
            let teamDoc = await MonitoringTeam.findOne({ team_name: teamName });
            if (!teamDoc) {
                teamDoc = await MonitoringTeam.create({
                    team_name: teamName,
                    regional_officer_id: officer._id,
                    members: teamMembers,
                    status: 'Active'
                });
                console.log(`Created team document: ${teamName}`);
            }
        }

        console.log('\n--- SEEDED CREDENTIALS ---');
        console.table(credentials);
        console.log('\nAll users use password: password123');
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
