import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendCredentialsEmail } from '../utils/mailer.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('super_admin'));

router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').populate('entityId', 'name type location').lean();
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { email, firstName, lastName, role, entityId } = req.body;
    if (!email) throw new AppError('Email requis', 400);

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('Cet email est déjà utilisé', 400);

    const pwd = Math.random().toString(36).slice(-8) + 'X8!';
    
    const userData = { email, password: pwd, firstName, lastName, role: role || 'member' };
    if (entityId) userData.entityId = entityId;

    const user = new User(userData);
    await user.save();
    
    // Send email with credentials
    const previewUrl = await sendCredentialsEmail(email, firstName, pwd, user.role);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj, previewUrl });
  } catch(e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { role, entityId, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role != null && { role }), ...(entityId != null && { entityId }), ...(isActive != null && { isActive }) },
      { new: true }
    ).select('-password');
    if (!user) throw new AppError('Utilisateur introuvable', 404);
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

export default router;
