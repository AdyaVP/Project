const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [contratos] = await pool.query('SELECT * FROM contratos ORDER BY created_at DESC');
    res.json(contratos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { reserva_id, cliente_id, cliente_name, vehiculo_info, start_date, end_date, terms, contrato_data, firma_cliente, firma_representante } = req.body;
    const [result] = await pool.query(
      'INSERT INTO contratos (reserva_id, cliente_id, cliente_name, vehiculo_info, start_date, end_date, terms, contrato_data, firma_cliente, firma_representante, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active")',
      [reserva_id, cliente_id, cliente_name, vehiculo_info, start_date, end_date, JSON.stringify(terms), JSON.stringify(contrato_data), firma_cliente, firma_representante]
    );
    res.status(201).json({ message: 'Contract created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
