const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../prithvinet.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('📡 Local SQLite Database Connected at:', dbPath);

module.exports = db;
