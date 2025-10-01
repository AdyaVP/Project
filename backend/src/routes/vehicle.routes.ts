import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/vehicles
 * @desc    Obtener todos los vehículos (con paginación y filtros)
 * @access  Private
 */
router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['available', 'reserved', 'maintenance', 'rented']),
    query('type').optional().isIn(['sedan', 'suv', 'truck', 'van']),
  ]),
  (req, res) => {
    res.json({ message: 'Get all vehicles - To be implemented' });
  }
);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Obtener vehículo por ID
 * @access  Private
 */
router.get(
  '/:id',
  validate([
    param('id').notEmpty().withMessage('Vehicle ID is required'),
  ]),
  (req, res) => {
    res.json({ message: `Get vehicle ${req.params.id} - To be implemented` });
  }
);

/**
 * @route   POST /api/vehicles
 * @desc    Crear nuevo vehículo
 * @access  Private (Admin, Super Admin)
 */
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validate([
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 2000, max: 2030 }).withMessage('Invalid year'),
    body('plate').trim().notEmpty().withMessage('Plate is required'),
    body('type').isIn(['sedan', 'suv', 'truck', 'van']).withMessage('Invalid type'),
    body('dailyRate').isFloat({ min: 0 }).withMessage('Daily rate must be positive'),
  ]),
  (req, res) => {
    res.json({ message: 'Create vehicle - To be implemented' });
  }
);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Actualizar vehículo
 * @access  Private (Admin, Super Admin)
 */
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Vehicle ID is required'),
  ]),
  (req, res) => {
    res.json({ message: `Update vehicle ${req.params.id} - To be implemented` });
  }
);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Eliminar vehículo
 * @access  Private (Admin, Super Admin)
 */
router.delete(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Vehicle ID is required'),
  ]),
  (req, res) => {
    res.json({ message: `Delete vehicle ${req.params.id} - To be implemented` });
  }
);

export default router;
