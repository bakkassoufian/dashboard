import express from 'express';
import Entity from '../models/Entity.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { getScopedEntityId } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { location, type, isActive } = req.query;
    const filter = {};
    const scope = getScopedEntityId(req.user);
    if (scope) {
      filter._id = scope;
    } else {
      if (location) filter.location = new RegExp(location, 'i');
      if (type) filter.type = type;
      if (isActive !== undefined) filter.isActive = isActive !== 'false';
    }
    const entities = await Entity.find(filter).lean();
    res.json({ success: true, data: entities });
  } catch (e) { next(e); }
});

router.use(authenticate);
router.use(authorize('super_admin', 'entity_manager'));

router.post('/', async (req, res, next) => {
  try {
    const entity = await Entity.create(req.body);
    res.status(201).json({ success: true, data: entity });
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entity) throw new AppError('Entité introuvable', 404);
    res.json({ success: true, data: entity });
  } catch (e) { next(e); }
});

export default router;
