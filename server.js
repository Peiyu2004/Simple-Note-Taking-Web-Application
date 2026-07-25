const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. Root Test Route ---
app.get('/', (req, res) => {
  res.json({ message: 'Note-Taking API is running successfully!' });
});

// --- 2. GET all notes ---
app.get('/api/notes', (req, res) => {
  const sql = 'SELECT * FROM notes ORDER BY createdAt DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// --- 2.5 GET single note by ID (FIXED ADDITION) ---
app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM notes WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json(row);
  });
});

// --- 3. POST create a new note ---
app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const sql = 'INSERT INTO notes (title, content) VALUES (?, ?)';
  db.run(sql, [title, content], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      title,
      content,
      createdAt: new Date().toISOString()
    });
  });
});

// --- 4. PUT update a note ---
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const sql = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
  db.run(sql, [title, content, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json({ id: Number(id), title, content });
  });
});

// --- 5. DELETE a note ---
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM notes WHERE id = ?';

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json({ message: 'Note deleted successfully.' });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});