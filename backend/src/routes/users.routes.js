const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// GET /api/users - Listar usuarios
router.get('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, phone, avatar, status, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// TODO: Implementar endpoints para crear, actualizar, eliminar usuarios

module.exports = router;
