const supabase = require('./src/config/supabaseClient');

async function checkConnection() {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Connection successful, industries count:', data);
    }
  } catch (err) {
    console.error('Unexpected Error:', err.message);
  }
}

checkConnection();
