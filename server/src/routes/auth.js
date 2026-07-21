import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('role').optional().isIn(['super_admin', 'entity_manager', 'formateur', 'communication', 'student']),
  body('entityId').optional().isMongoId(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);
      const { email, password, firstName, lastName, role, entityId } = req.body;
      const existing = await User.findOne({ email });
      if (existing) throw new AppError('Email déjà utilisé', 400);
      const user = await User.create({ email, password, firstName, lastName, role, entityId });
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      res.status(201).json({
        success: true,
        data: { user: { _id: user._id, email: user.email, firstName, lastName, role: user.role, entityId: user.entityId }, token },
      });
    } catch (e) { next(e); }
  }
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError('Email ou mot de passe invalide', 400);
      const user = await User.findOne({ email: req.body.email }).select('+password');
      if (!user || !(await user.comparePassword(req.body.password)))
        throw new AppError('Identifiants incorrects', 401);
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      const u = await User.findById(user._id).select('-password');
      res.json({ success: true, data: { user: u, token } });
    } catch (e) { next(e); }
  }
);

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
