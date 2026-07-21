import express from 'express';
import Participant from '../models/Participant.js';
import Formation from '../models/Formation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { getScopedEntityId, getScopedParticipantObjectIdsForEntity } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const {
      specialty, educationLevel, recommendedForJobDating, formationId,
      search, gender, ageCategory, limit = 50, skip = 0,
    } = req.query;
    const filter = {};
    if (specialty) filter.specialty = new RegExp(specialty, 'i');
    if (educationLevel) filter.educationLevel = new RegExp(educationLevel, 'i');
    if (gender) filter.gender = gender;
    if (ageCategory) filter.ageCategory = new RegExp(ageCategory, 'i');
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { specialty: new RegExp(search, 'i') },
      ];
    }

    const scope = getScopedEntityId(req.user);
    const inEntity = scope ? new Set(
      (await getScopedParticipantObjectIdsForEntity(scope)).map((id) => String(id)),
    ) : null;

    if (formationId) {
      if (scope) {
        const allowedForm = await Formation.findOne({ _id: formationId, entityId: scope });
        if (!allowedForm) {
          return res.json({ success: true, data: [], total: 0 });
        }
      }
      const { default: Attendance } = await import('../models/Attendance.js');
      const attFilter = { formationId };
      if (recommendedForJobDating === 'true') {
        attFilter.recommendedForJobDating = true;
      }
      const fromAtt = await Attendance.find(attFilter).distinct('participantId');
      const ids = scope
        ? fromAtt.filter((id) => inEntity.has(String(id)))
        : fromAtt;
      if (!ids.length) {
        return res.json({ success: true, data: [], total: 0 });
      }
      filter._id = { $in: ids };
    } else if (recommendedForJobDating === 'true') {
      const { default: Attendance } = await import('../models/Attendance.js');
      const fromAtt = await Attendance.find({ recommendedForJobDating: true }).distinct('participantId');
      const ids = scope
        ? fromAtt.filter((id) => inEntity.has(String(id)))
        : fromAtt;
      if (!ids.length) {
        return res.json({ success: true, data: [], total: 0 });
      }
      filter._id = { $in: ids };
    } else if (scope) {
      if (!inEntity || inEntity.size === 0) {
        return res.json({ success: true, data: [], total: 0 });
      }
      filter._id = { $in: [...inEntity] };
    }

    const [participants, total] = await Promise.all([
      Participant.find(filter).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)).lean(),
      Participant.countDocuments(filter),
    ]);
    res.json({ success: true, data: participants, total });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Participant.findById(req.params.id).lean();
    if (!p) throw new AppError('Participant introuvable', 404);
    const scope = getScopedEntityId(req.user);
    if (scope) {
      const allowed = new Set(
        (await getScopedParticipantObjectIdsForEntity(scope)).map((id) => String(id)),
      );
      if (!allowed.has(String(p._id))) {
        throw new AppError('Accès refusé', 403);
      }
    }
    res.json({ success: true, data: p });
  } catch (e) { next(e); }
});

router.use(authorize('super_admin', 'entity_manager', 'formateur', 'communication'));

router.post('/', async (req, res, next) => {
  try {
    const participant = await Participant.create(req.body);
    res.status(201).json({ success: true, data: participant });
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const participant = await Participant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!participant) throw new AppError('Participant introuvable', 404);
    res.json({ success: true, data: participant });
  } catch (e) { next(e); }
});

export default router;
