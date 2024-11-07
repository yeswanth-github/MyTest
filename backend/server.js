const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); 

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/', (req, res) => {
  res.send('Hello from Express Server!');
});

app.post('/items', async (req, res) => {
  const { name } = req.body;
  try {
    const newItem = await pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.get('/items', async (req, res) => {
  try {
    const items = await pool.query('SELECT * FROM items');
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedItem = await pool.query(
      'UPDATE items SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(updatedItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
