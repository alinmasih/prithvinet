const supabase = require('./src/config/supabaseClient');

async function checkVisibility() {
  const tables = ['users', 'industries', 'monitoring_stations', 'monitoring_logs', 'alerts'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: Visible`);
    }
  }
}

checkVisibility();
