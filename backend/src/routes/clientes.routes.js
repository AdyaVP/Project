const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/clientes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [clientes] = await pool.query('SELECT * FROM clientes ORDER BY created_at DESC');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/clientes
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, company, country } = req.body;
    const [result] = await pool.query(
      'INSERT INTO clientes (name, email, phone, company, country, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, company, country, req.user.id]
    );
    res.status(201).json({ message: 'Client created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Implementar PUT, DELETE, PATCH para aprobar/rechazar

module.exports = router;
