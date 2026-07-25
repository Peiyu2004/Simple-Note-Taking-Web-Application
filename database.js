const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'notes.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');

    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        return;
      }

      // Insert dummy note
      const insertSql = `INSERT INTO notes (title, content) VALUES (?, ?)`;
      db.run(insertSql, ['First Test Note', 'This is content inside SQLite!'], function (err) {
        if (err) {
          console.error('Insert error:', err.message);
        } else {
          console.log(`Successfully inserted row with ID: ${this.lastID}`);
        }
      });
    });
  }
});

module.exports = db;