const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// GET /api/reservas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [reservas] = await pool.query('SELECT * FROM reservas ORDER BY created_at DESC');
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reservas - Crear pre-reserva (OPERADOR)
router.post('/', authMiddleware, roleMiddleware('OPERADOR', 'ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { cliente_id, cliente_name, vehiculo_id, vehiculo_info, start_date, end_date, days, total_amount, notes, inspeccion_data } = req.body;
    const [result] = await pool.query(
      'INSERT INTO reservas (cliente_id, cliente_name, vehiculo_id, vehiculo_info, start_date, end_date, days, total_amount, notes, inspeccion_data, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")',
      [cliente_id, cliente_name, vehiculo_id, vehiculo_info, start_date, end_date, days, total_amount, notes, JSON.stringify(inspeccion_data || {}), req.user.id]
    );
    res.status(201).json({ message: 'Reservation created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/reservas/:id/approve - Aprobar reserva (ADMIN/SUPER_ADMIN)
router.patch('/:id/approve', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    await pool.query(
      'UPDATE reservas SET status = "confirmed", approved_by = ?, approved_at = NOW() WHERE id = ?',
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Reservation approved' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Implementar más endpoints (cancelar, actualizar, etc.)

module.exports = router;
