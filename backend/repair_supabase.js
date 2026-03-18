const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_URL.replace('https://', 'postgres://postgres:ishani0704@').replace('.supabase.co', '.supabase.co:5432/postgres'),
  ssl: { rejectUnauthorized: false }
});

async function repair() {
  try {
    await client.connect();
    console.log('Connected to Postgres directly.');

    // Check tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in DB:', res.rows.map(r => r.table_name));

    // Ensure monitoring_logs exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS monitoring_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        monitoring_type TEXT NOT NULL,
        location TEXT,
        value JSONB,
        remarks TEXT,
        submitted_by UUID REFERENCES users(id),
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Ensured monitoring_logs exists.');

    // Reload PostgREST schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('Reloaded PostgREST schema cache.');

  } catch (err) {
    console.error('Repair Error:', err.message);
  } finally {
    await client.end();
  }
}

repair();
