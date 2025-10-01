import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
// import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role')
      .optional()
      .isIn(['SUPER_ADMIN', 'ADMIN', 'OPERADOR', 'CLIENTE'])
      .withMessage('Invalid role'),
  ]),
  // authController.register
  (req, res) => {
    res.json({ message: 'Register endpoint - To be implemented' });
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  // authController.login
  (req, res) => {
    res.json({ message: 'Login endpoint - To be implemented' });
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar token
 * @access  Public
 */
router.post('/refresh', (req, res) => {
  res.json({ message: 'Refresh token endpoint - To be implemented' });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout de usuario
 * @access  Private
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - To be implemented' });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar reset de contraseña
 * @access  Public
 */
router.post(
  '/forgot-password',
  validate([
    body('email').isEmail().withMessage('Invalid email address'),
  ]),
  (req, res) => {
    res.json({ message: 'Forgot password endpoint - To be implemented' });
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Resetear contraseña
 * @access  Public
 */
router.post(
  '/reset-password',
  validate([
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ]),
  (req, res) => {
    res.json({ message: 'Reset password endpoint - To be implemented' });
  }
);

export default router;
