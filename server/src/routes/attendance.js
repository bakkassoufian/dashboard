import express from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Formation from '../models/Formation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { getScopedEntityId, managerReadOnly, assertMemberCanAccessFormation } from '../middleware/rbac.js';

const router = express.Router();
router.use(authenticate);
router.use(managerReadOnly);

router.get('/', async (req, res, next) => {
  try {
    const { formationId, participantId, recommendedForJobDating, status } = req.query;
    const filter = {};
    const scope = getScopedEntityId(req.user);
    if (scope) {
      const fIds = await Formation.find({ entityId: scope }).distinct('_id');
      if (!fIds.length) {
        return res.json({ success: true, data: [] });
      }
      if (formationId) {
        if (!fIds.some((id) => String(id) === String(formationId))) {
          return res.json({ success: true, data: [] });
        }
        filter.formationId = formationId;
      } else {
        filter.formationId = { $in: fIds };
      }
    } else {
      if (formationId) filter.formationId = formationId;
    }
    if (participantId) {
      if (!mongoose.Types.ObjectId.isValid(String(participantId))) {
        return res.json({ success: true, data: [] });
      }
      filter.participantId = participantId;
    }
    if (recommendedForJobDating !== undefined) {
      filter.recommendedForJobDating = recommendedForJobDating === 'true';
    }
    if (status) filter.status = status;
    const list = await Attendance.find(filter)
      .populate('participantId')
      .populate('formationId', 'title dateStart entityId')
      .lean();
    res.json({ success: true, data: list });
  } catch (e) { next(e); }
});

router.post('/', authorize('super_admin', 'coordinator', 'member', 'member-odc-hybrid'), async (req, res, next) => {
  try {
    const { participantId, formationId, status, recommendedForJobDating, notes } = req.body;
    if (!formationId) throw new AppError('formationId requis', 400);
    const formation = await Formation.findById(formationId);
    if (!formation) throw new AppError('Formation introuvable', 404);
    assertMemberCanAccessFormation(formation, req.user);
    const att = await Attendance.findOneAndUpdate(
      { participantId, formationId },
      { status: status || 'inscrit', recommendedForJobDating: !!recommendedForJobDating, notes },
      { upsert: true, new: true }
    ).populate('participantId').populate('formationId');
    res.status(201).json({ success: true, data: att });
  } catch (e) { next(e); }
});

router.patch('/:id', authorize('super_admin', 'coordinator', 'member', 'member-odc-hybrid'), async (req, res, next) => {
  try {
    const existing = await Attendance.findById(req.params.id).populate('formationId');
    if (!existing) throw new AppError('Inscription introuvable', 404);
    await assertMemberCanAccessFormation(existing.formationId, req.user);
    const att = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('participantId').populate('formationId');
    res.json({ success: true, data: att });
  } catch (e) { next(e); }
});

export default router;
