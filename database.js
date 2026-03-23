const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'sensor_data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        temperature REAL,
        humidity REAL
    )`);
});

const insertReading = (temp, hum) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO readings (temperature, humidity) VALUES (?, ?)`, [temp, hum], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

const getHistory = (hoursFromNow) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT timestamp || 'Z' as timestamp, temperature, humidity 
            FROM readings 
            WHERE timestamp >= datetime('now', ?) 
            ORDER BY timestamp ASC
        `;
        db.all(query, [`-${hoursFromNow} hours`], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    insertReading,
    getHistory,
    db
};
