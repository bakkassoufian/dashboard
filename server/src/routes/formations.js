import express from 'express';
import multer from 'multer';
import path from 'path';
import Formation from '../models/Formation.js';
import Attendance from '../models/Attendance.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { getScopedEntityId, managerReadOnly, assertMemberCanAccessFormation } from '../middleware/rbac.js';
import { isCloudinaryConfigured, uploadFormationImageBuffer } from '../utils/cloudinary.js';

const getStorage = () => {
  if (isCloudinaryConfigured() || process.env.VERCEL) {
    return multer.memoryStorage();
  }
  return multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
};

const upload = multer({
  storage: getStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const router = express.Router();

router.use(authenticate);
router.use(authorize('super_admin', 'manager', 'coordinator', 'member', 'member-odc-hybrid'));
router.use(managerReadOnly);

router.get('/', async (req, res, next) => {
  try {
    const { location, entityId, status, trainerName, activityType, dateFrom, dateTo, limit = 100, skip = 0 } = req.query;
    const filter = {};
    const scope = getScopedEntityId(req.user);
    if (scope) {
      filter.entityId = scope;
    } else if (entityId) {
      filter.entityId = entityId;
    }
    if (location) filter.location = new RegExp(location, 'i');
    if (status) filter.status = status;
    if (activityType) filter.activityType = activityType;
    if (trainerName) filter.trainerName = new RegExp(trainerName, 'i');
    // Période : date de session dans l’intervalle, OU pas encore de date mais création dans l’intervalle (liste après création)
    if (dateFrom || dateTo) {
      const range = {};
      if (dateFrom) range.$gte = new Date(dateFrom);
      if (dateTo) {
        const t = new Date(dateTo);
        t.setHours(23, 59, 59, 999);
        range.$lte = t;
      }
      filter.$or = [
        { dateStart: { ...range } },
        {
          $and: [
            { $or: [{ dateStart: null }, { dateStart: { $exists: false } }] },
            { createdAt: { ...range } },
          ],
        },
      ];
    }
    const [formations, total] = await Promise.all([
      Formation.find(filter).populate('entityId', 'name type location').sort({ dateStart: -1 }).skip(Number(skip)).limit(Number(limit)).lean(),
      Formation.countDocuments(filter),
    ]);
    res.json({ success: true, data: formations, total });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const f = await Formation.findById(req.params.id).populate('entityId');
    if (!f) throw new AppError('Formation introuvable', 404);
    assertMemberCanAccessFormation(f, req.user);
    res.json({ success: true, data: f });
  } catch (e) { next(e); }
});

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const data = { ...req.body };
    ['pfeStagiaireCount', 'pfeAnnee', 'pfeStageMonths'].forEach((k) => {
      if (data[k] === '' || data[k] == null) delete data[k];
      else {
        const n = Number(data[k]);
        if (!Number.isNaN(n)) data[k] = n;
        else delete data[k];
      }
    });
    const scope = getScopedEntityId(req.user);
    if (scope) {
      data.entityId = scope;
    } else {
      // Coordon. / super_admin : le scope n’impose pas l’entité — défaut = entité rattachée au compte
      const e = req.user?.entityId;
      const fromUser = e && (e._id != null ? e._id : e);
      if (fromUser && (data.entityId == null || data.entityId === '')) {
        data.entityId = fromUser;
      }
    }
    if (req.file) {
      if (isCloudinaryConfigured() && req.file.buffer) {
        data.imageUrl = await uploadFormationImageBuffer(req.file.buffer);
      } else if (req.file.filename) {
        data.imageUrl = `/uploads/${req.file.filename}`;
      }
    }
    if (!data.entityId) {
      throw new AppError("L'entité (entityId) est obligatoire pour créer une formation.", 400);
    }
    const formation = await Formation.create({ ...data, createdBy: req.user._id });
    const populated = await Formation.findById(formation._id).populate('entityId');
    res.status(201).json({ success: true, data: populated });
  } catch (e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await Formation.findById(req.params.id);
    if (!existing) throw new AppError('Formation introuvable', 404);
    assertMemberCanAccessFormation(existing, req.user);
    const data = { ...req.body };
    ['pfeStagiaireCount', 'pfeAnnee', 'pfeStageMonths'].forEach((k) => {
      if (data[k] === '' || data[k] == null) delete data[k];
      else {
        const n = Number(data[k]);
        if (!Number.isNaN(n)) data[k] = n;
        else delete data[k];
      }
    });
    const formation = await Formation.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate('entityId');
    res.json({ success: true, data: formation });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const f = await Formation.findById(req.params.id);
    if (!f) throw new AppError('Formation introuvable', 404);
    assertMemberCanAccessFormation(f, req.user);
    await Attendance.deleteMany({ formationId: f._id });
    await Formation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Formation supprimée' });
  } catch (e) { next(e); }
});

export default router;
