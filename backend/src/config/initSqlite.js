const db = require('./localDb');

function initDatabase() {
  console.log('🏗️ Initializing local SQLite schema...');

  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'Industry User',
      assigned_region TEXT,
      industry_id TEXT,
      approved_status INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Industries Table
    CREATE TABLE IF NOT EXISTS industries (
      id TEXT PRIMARY KEY,
      industry_name TEXT NOT NULL,
      address TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_activity TEXT NOT NULL,
      production_starting_date TEXT,
      production_capacity TEXT,
      unit TEXT,
      entity_name TEXT,
      entity_type TEXT,
      incorporation_date TEXT,
      registration_number TEXT,
      pan_number TEXT,
      gst_number TEXT,
      msme_number TEXT,
      license_number TEXT,
      office_address TEXT,
      operational_address TEXT,
      contact_mobile TEXT,
      contact_email TEXT,
      owner_name TEXT,
      owner_mobile TEXT,
      owner_email TEXT,
      place TEXT,
      district TEXT,
      location_lat REAL,
      location_lng REAL,
      industry_type TEXT DEFAULT 'Other',
      industry_category TEXT DEFAULT 'White',
      approval_status TEXT DEFAULT 'Pending',
      regional_officer_id TEXT,
      region_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (regional_officer_id) REFERENCES users(id),
      FOREIGN KEY (region_id) REFERENCES regional_offices(id)
    );

    -- Monitoring Logs Table
    CREATE TABLE IF NOT EXISTS monitoring_logs (
      id TEXT PRIMARY KEY,
      monitoring_type TEXT NOT NULL,
      location TEXT,
      value TEXT, -- JSON string
      submitted_by TEXT,
      region_id TEXT,
      remarks TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submitted_by) REFERENCES users(id)
    );

    -- Alerts Table
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'Low',
      status TEXT DEFAULT 'Open',
      complaint_id TEXT,
      industry_id TEXT,
      station_id TEXT,
      assigned_officer TEXT,
      region_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Regional Offices Table
    CREATE TABLE IF NOT EXISTS regional_offices (
      id TEXT PRIMARY KEY,
      office_name TEXT UNIQUE NOT NULL,
      district TEXT NOT NULL,
      address TEXT NOT NULL,
      office_head TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Monitoring Stations Table
    CREATE TABLE IF NOT EXISTS monitoring_stations (
      id TEXT PRIMARY KEY,
      station_name TEXT NOT NULL,
      location_lat REAL,
      location_lng REAL,
      status TEXT DEFAULT 'Active',
      region_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (region_id) REFERENCES regional_offices(id)
    );

    -- Monitoring Teams Table
    CREATE TABLE IF NOT EXISTS monitoring_teams (
      id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL,
      regional_officer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (regional_officer_id) REFERENCES users(id)
    );

    -- Monitoring Team Members Table
    CREATE TABLE IF NOT EXISTS monitoring_team_members (
      team_id TEXT,
      user_id TEXT,
      PRIMARY KEY (team_id, user_id),
      FOREIGN KEY (team_id) REFERENCES monitoring_teams(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed default Admin if not exists
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@prithvinet.gov.in');
  if (!adminExists) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, approved_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      '00000000-0000-0000-0000-000000000000',
      'System Admin',
      'admin@prithvinet.gov.in',
      '$2b$10$QEK1xWlqczackQlGOqItmuSXQjinFqizwMvQype/.G8Jp8DFA1/9y', // admin123
      'Admin',
      1,
      'Active'
    );
    console.log('✅ Default Admin seeded.');
  } else if (adminExists.id !== '00000000-0000-0000-0000-000000000000') {
    db.prepare('UPDATE users SET id = ?, password = ? WHERE email = ?').run(
      '00000000-0000-0000-0000-000000000000',
      '$2b$10$QEK1xWlqczackQlGOqItmuSXQjinFqizwMvQype/.G8Jp8DFA1/9y',
      'admin@prithvinet.gov.in'
    );
    console.log('✅ Admin credentials standardized.');
  }

  // Seed some offices if empty
  const officeCount = db.prepare('SELECT count(*) as count FROM regional_offices').get().count;
  if (officeCount === 0) {
    const offices = [
      ['RO-001', 'Raipur Regional Office', 'Raipur', 'Civic Center, Raipur', 'Dr. S. Kumar', '0771-123456'],
      ['RO-002', 'Bhilai Regional Office', 'Durg', 'Industrial Estate, Bhilai', 'Er. R. Singh', '0788-654321'],
      ['RO-003', 'Korba Regional Office', 'Korba', 'TP Nagar, Korba', 'Mr. A. Dixit', '07759-987654']
    ];
    const insertOffice = db.prepare('INSERT INTO regional_offices (id, office_name, district, address, office_head, phone) VALUES (?, ?, ?, ?, ?, ?)');
    offices.forEach(o => insertOffice.run(...o));
    console.log('✅ Regional Offices seeded.');
  }

  // Seed Industries and Compliance Reports from provided image
  const imageIndCount = db.prepare("SELECT count(*) as count FROM industries WHERE id LIKE 'IND-%'").get().count;
  if (imageIndCount === 0) {
    const industries = [
      ['IND-001', 'Maa Mahamaya Sahakari Karkhana Mydt', 'Civic Center', 'Sugar', 'Sugar Production', 'AMBIKAPUR', 'MANOJ KUMAR PADHI', '8718996259'],
      ['IND-002', 'ACC LTD, JAMUL CEMENT WORKS', 'Jamul', 'Cement', 'Cement Manufacturing', 'BHILAI', 'MR. VINAY KAPUR', '9752599818'],
      ['IND-003', 'BHILAI STEEL PLANT', 'Bhilai', 'Steel', 'Steel Production', 'BHILAI', 'Mr. R G Gupta', '9407981464'],
      ['IND-004', 'AIRAN STEEL & POWER PVT LTD', 'Bilaspur', 'Steel', 'Steel Power', 'BILASPUR', 'ALOK AGRWAL', '9753019594'],
      ['IND-005', 'BEC FERTILIZERS', 'Bilaspur', 'Fertilizer', 'Chemicals', 'BILASPUR', 'S.SATHEEESAN', '9826110353'],
      ['IND-006', 'BHATIA WINES MERCHANTS', 'Bilaspur', 'Alcohol', 'Wines', 'BILASPUR', 'B B SINGH', '9229228461'],
      ['IND-007', 'CHHATTISGARH STATE POWER GENERATION COMPANY LIMITED', 'Bilaspur', 'Power', 'Electricity', 'BILASPUR', 'RAJDEEP VERMA', '8319970527'],
      ['IND-008', 'DB POWER LIMITED', 'Bilaspur', 'Power', 'Thermal', 'BILASPUR', 'MR. VIJAI PAL SINGH', '9109951037'],
      ['IND-009', 'GEETANJALI ISPAT & POWERS PVT LTD', 'Bilaspur', 'Steel', 'Steel Fabrication', 'BILASPUR', 'Jayant Agrawal', '9575042807'],
      ['IND-010', 'MADHYABHARAT PAPER LIMITED', 'Bilaspur', 'Paper', 'Paper Production', 'BILASPUR', 'MK Ganguly', '8777522374'],
      ['IND-011', 'NTPC Limited', 'Bilaspur', 'Power', 'Public Utility', 'BILASPUR', 'Anurag Shukla', '9425553564'],
      ['IND-012', 'PRAKASH INDUSTRIES LIMITED', 'Bilaspur', 'Steel', 'Industry', 'BILASPUR', 'MR Santosh Thawait', '7869964925'],
      ['IND-013', 'RKM POWER GEN', 'Bilaspur', 'Power', 'Generation', 'BILASPUR', 'Mr. SN Pandey', '9575301003']
    ];

    const insertInd = db.prepare(`
      INSERT OR REPLACE INTO industries (id, industry_name, address, product_name, product_activity, district, owner_name, owner_mobile, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
    `);
    
    industries.forEach(ind => insertInd.run(...ind));
    console.log('✅ Industries seeded from image.');

    // Seed Compliance Logs
    const complianceData = [
      ['IND-001', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 0 }, eqms: { online: 0, offline: 5 } }],
      ['IND-002', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 7 }, eqms: { online: 0, offline: 0 } }],
      ['IND-003', { aaqms: { online: 0, offline: 7 }, cems: { online: 37, offline: 0 }, eqms: { online: 0, offline: 0 } }],
      ['IND-004', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 1 }, eqms: { online: 0, offline: 0 } }],
      ['IND-005', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 4 }, eqms: { online: 0, offline: 2 } }],
      ['IND-006', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 2 }, eqms: { online: 0, offline: 2 } }],
      ['IND-007', { aaqms: { online: 0, offline: 5 }, cems: { online: 0, offline: 6 }, eqms: { online: 0, offline: 3 } }],
      ['IND-008', { aaqms: { online: 0, offline: 20 }, cems: { online: 0, offline: 6 }, eqms: { online: 0, offline: 3 } }],
      ['IND-009', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 1 }, eqms: { online: 0, offline: 0 } }],
      ['IND-010', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 2 }, eqms: { online: 0, offline: 2 } }],
      ['IND-011', { aaqms: { online: 0, offline: 15 }, cems: { online: 0, offline: 15 }, eqms: { online: 0, offline: 8 } }],
      ['IND-012', { aaqms: { online: 0, offline: 0 }, cems: { online: 0, offline: 30 }, eqms: { online: 0, offline: 4 } }],
      ['IND-013', { aaqms: { online: 0, offline: 20 }, cems: { online: 0, offline: 8 }, eqms: { online: 0, offline: 3 } }]
    ];

    const insertLog = db.prepare(`
      INSERT OR REPLACE INTO monitoring_logs (id, monitoring_type, location, value, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    complianceData.forEach(([indId, val]) => {
      const industry = industries.find(i => i[0] === indId);
      const logId = 'log-compliance-' + indId; // Deterministic ID for replacing
      insertLog.run(
        logId,
        'Compliance',
        industry[5], // District as location
        JSON.stringify({ ...val, industry_id: indId }),
        new Date().toISOString()
      );
    });
    console.log('✅ Daily Compliance Logs seeded.');
  }

  console.log('✅ Local SQLite schema initialized.');
}

module.exports = initDatabase;
