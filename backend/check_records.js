const db = require('./src/config/localDb');

const alerts = db.prepare("SELECT * FROM alerts WHERE type = 'Citizen Complaint' ORDER BY timestamp DESC LIMIT 1").get();
console.log('--- LATEST CITIZEN COMPLAINT ALERT ---');
console.log(JSON.stringify(alerts, null, 2));

const logs = db.prepare("SELECT * FROM monitoring_logs WHERE monitoring_type = 'Complaint' ORDER BY timestamp DESC LIMIT 1").get();
console.log('\n--- LATEST COMPLAINT LOG ---');
console.log(JSON.stringify(logs, null, 2));
