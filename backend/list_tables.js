const supabase = require('./src/config/supabaseClient');

async function listTables() {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (error) {
    console.error('Error listing tables:', error.message);
    // Try another way - select from a common table
    const { data: stations } = await supabase.from('monitoring_stations').select('id').limit(1);
    console.log('Can access monitoring_stations:', !!stations);
    return;
  }
  
  console.log('Available tables:', data.map(t => t.table_name));
}

listTables();
