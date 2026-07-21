import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) throw new AppError('Non autorisé', 401);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password').populate('entityId');
    if (!user) {
      throw new AppError('Session ou compte invalide. Déconnectez-vous et reconnectez-vous.', 401);
    }
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError') return next(new AppError('Token invalide', 401));
    if (e.name === 'TokenExpiredError') return next(new AppError('Token expiré', 401));
    next(e);
  }
}

const ROLES = ['super_admin', 'manager', 'coordinator', 'member', 'member-odc-hybrid'];

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Non autorisé', 401));
    const role = req.user.role;
    if (!ROLES.includes(role)) return next(new AppError('Rôle invalide', 403));
    if (allowedRoles.length && !allowedRoles.includes(role))
      return next(new AppError('Accès refusé pour ce rôle', 403));
    next();
  };
}
