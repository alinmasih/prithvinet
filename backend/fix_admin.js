const db = require('./src/config/localDb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function fixAdmin() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  db.prepare('DELETE FROM users WHERE email = ?').run('admin@prithvinet.gov.in');
  
  db.prepare(`
    INSERT INTO users (id, name, email, password, role, approved_status, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    'System Admin',
    'admin@prithvinet.gov.in',
    hashedPassword,
    'Admin',
    1,
    'Active'
  );
  
  console.log('✅ Admin fixed with password: admin123');
}

fixAdmin();
