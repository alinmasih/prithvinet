const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('📡 Checking Supabase tables...');
  
  // Try to query common tables
  const tables = ['regional_offices', 'industries', 'monitoring_logs', 'alerts', 'users'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': Found (${data.length} records sample)`);
    }
  }
}

checkTables();
