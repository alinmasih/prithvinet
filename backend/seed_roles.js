const db = require('./src/config/localDb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seedRoles() {
  console.log('--- Seeding Role-Based Test Accounts ---');
  
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);
  
  const roles = [
    {
      id: uuidv4(),
      name: 'Regional Officer Name',
      email: 'officer@prithvinet.gov.in',
      password: password,
      role: 'Regional Officer',
      approved_status: 1,
      status: 'Active'
    },
    {
      id: uuidv4(),
      name: 'Monitoring Team Leader',
      email: 'monitor@prithvinet.gov.in',
      password: password,
      role: 'Monitoring Team',
      approved_status: 1,
      status: 'Active'
    },
    {
      id: uuidv4(),
      name: 'Industry Test User',
      email: 'industry@prithvinet.gov.in',
      password: password,
      role: 'Industry User',
      approved_status: 1,
      status: 'Active'
    }
  ];

  const insert = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password, role, approved_status, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  roles.forEach(user => {
    try {
      insert.run(user.id, user.name, user.email, user.password, user.role, user.approved_status, user.status);
      console.log(`✅ Seeded: ${user.email} (${user.role})`);
    } catch (err) {
      console.error(`❌ Failed to seed ${user.email}:`, err.message);
    }
  });

  console.log('--- Seeding Complete ---');
  console.log('Credentials:');
  console.log('Emails: officer@prithvinet.gov.in, monitor@prithvinet.gov.in, industry@prithvinet.gov.in');
  console.log('Password: password123');
}

seedRoles().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
