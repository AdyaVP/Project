const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const [reports] = await pool.query('SELECT * FROM damage_reports ORDER BY created_at DESC');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reports', authMiddleware, async (req, res) => {
  try {
    const { vehiculo_id, vehiculo_info, cliente_id, cliente_name, fecha, danos, total_estimado } = req.body;
    const [result] = await pool.query(
      'INSERT INTO damage_reports (vehiculo_id, vehiculo_info, cliente_id, cliente_name, fecha, danos, total_estimado, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [vehiculo_id, vehiculo_info, cliente_id, cliente_name, fecha, JSON.stringify(danos), total_estimado, req.user.id]
    );
    res.status(201).json({ message: 'Damage report created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
