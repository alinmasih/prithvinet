const db = require('./src/config/localDb');

function checkAlerts() {
  const alerts = db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 5').all();
  console.log('Recent Alerts:', alerts);
}

checkAlerts();
