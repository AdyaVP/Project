const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [facturas] = await pool.query('SELECT * FROM facturas ORDER BY created_at DESC');
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reserva_id, cliente_id, cliente_name, amount, tax, total, anticipo, monto_pendiente, issue_date, due_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO facturas (reserva_id, cliente_id, cliente_name, amount, tax, total, anticipo, monto_pendiente, issue_date, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [reserva_id, cliente_id, cliente_name, amount, tax, total, anticipo || 0, monto_pendiente, issue_date, due_date, req.user.id]
    );
    res.status(201).json({ message: 'Invoice created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
