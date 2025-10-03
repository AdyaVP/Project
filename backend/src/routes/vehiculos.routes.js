const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// GET /api/vehiculos - Listar todos los vehículos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [vehiculos] = await pool.query('SELECT * FROM vehiculos ORDER BY created_at DESC');
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/vehiculos/:id - Obtener un vehículo específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [vehiculos] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [req.params.id]);
    if (vehiculos.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehiculos[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/vehiculos - Crear nuevo vehículo
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { brand, model, year, plate, type, daily_rate, features, image } = req.body;
    const [result] = await pool.query(
      'INSERT INTO vehiculos (brand, model, year, plate, type, daily_rate, features, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, model, year, plate, type, daily_rate, JSON.stringify(features || []), image]
    );
    res.status(201).json({ message: 'Vehicle created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/vehiculos/:id - Actualizar vehículo
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { brand, model, year, plate, type, daily_rate, features, image, status } = req.body;
    await pool.query(
      'UPDATE vehiculos SET brand=?, model=?, year=?, plate=?, type=?, daily_rate=?, features=?, image=?, status=? WHERE id=?',
      [brand, model, year, plate, type, daily_rate, JSON.stringify(features || []), image, status, req.params.id]
    );
    res.json({ message: 'Vehicle updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/vehiculos/:id - Eliminar vehículo
router.delete('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    await pool.query('DELETE FROM vehiculos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
