const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ totalCustomers }]] = await pool.query('SELECT COUNT(*) as totalCustomers FROM clientes WHERE status != "inactive"');
    const [[{ totalVehicles }]] = await pool.query('SELECT COUNT(*) as totalVehicles FROM vehiculos');
    const [[{ availableVehicles }]] = await pool.query('SELECT COUNT(*) as availableVehicles FROM vehiculos WHERE status = "available"');
    const [[{ pendingReservations }]] = await pool.query('SELECT COUNT(*) as pendingReservations FROM reservas WHERE status = "pending"');
    const [[{ monthlyRevenue }]] = await pool.query('SELECT COALESCE(SUM(total), 0) as monthlyRevenue FROM facturas WHERE MONTH(issue_date) = MONTH(NOW()) AND YEAR(issue_date) = YEAR(NOW())');
    
    res.json({
      totalCustomers,
      totalVehicles,
      availableVehicles,
      pendingReservations,
      monthlyRevenue: parseFloat(monthlyRevenue) || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
