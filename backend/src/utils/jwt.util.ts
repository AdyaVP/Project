import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

/**
 * Generar token JWT
 */
export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generar refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verificar token JWT
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret) as JWTPayload;
};

/**
 * Verificar refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret) as JWTPayload;
};

/**
 * Decodificar token sin verificar (útil para debugging)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
