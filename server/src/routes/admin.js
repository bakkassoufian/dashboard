import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import RolePermission from '../models/RolePermission.js';
import ActivityLog from '../models/ActivityLog.js';
import PlatformSetting from '../models/PlatformSetting.js';
import ManualKpi from '../models/ManualKpi.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

const ROLES = ['super_admin', 'manager', 'coordinator', 'member'];
const DEFAULTS = {
  super_admin: { read: true, write: true, export: true, delete: true },
  manager: { read: true, write: true, export: true, delete: false },
  coordinator: { read: true, write: false, export: true, delete: false },
  member: { read: true, write: true, export: false, delete: false },
};

router.use(authenticate);
router.use(authorize('super_admin'));

router.get('/permissions', async (_req, res, next) => {
  try {
    const docs = await RolePermission.find({ role: { $in: ROLES } }).lean();
    const map = new Map(docs.map((d) => [d.role, d.permissions]));
    const data = ROLES.map((role) => ({ role, permissions: map.get(role) || DEFAULTS[role] }));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.put('/permissions/:role', async (req, res, next) => {
  try {
    const { role } = req.params;
    if (!ROLES.includes(role)) throw new AppError('Rôle invalide', 400);
    const p = req.body?.permissions || {};
    const permissions = {
      read: !!p.read,
      write: !!p.write,
      export: !!p.export,
      delete: !!p.delete,
    };
    const doc = await RolePermission.findOneAndUpdate(
      { role },
      { role, permissions },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, data: doc });
  } catch (e) { next(e); }
});

router.get('/logs', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action = '', email = '', dateFrom = '', dateTo = '' } = req.query;
    const q = {};
    if (action) q.action = new RegExp(String(action).trim(), 'i');
    if (email) q.actorEmail = new RegExp(String(email).trim(), 'i');
    if (dateFrom || dateTo) {
      q.createdAt = {};
      if (dateFrom) q.createdAt.$gte = new Date(dateFrom);
      if (dateTo) q.createdAt.$lte = new Date(dateTo);
    }
    const p = Math.max(Number(page) || 1, 1);
    const l = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const [data, total] = await Promise.all([
      ActivityLog.find(q).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      ActivityLog.countDocuments(q),
    ]);
    res.json({ success: true, data, page: p, limit: l, total });
  } catch (e) { next(e); }
});

router.get('/settings', async (_req, res, next) => {
  try {
    const doc = await PlatformSetting.findOne({ singleton: 'platform' }).lean();
    const data = doc || {
      singleton: 'platform',
      centers: ['Casablanca', 'Rabat', 'Agadir'],
      periods: [
        { key: 'month', label: 'Mois', enabled: true },
        { key: 'semester', label: 'Semestre', enabled: true },
        { key: 'year', label: 'Année', enabled: true },
      ],
    };
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.put('/settings', async (req, res, next) => {
  try {
    const centers = Array.isArray(req.body?.centers) ? req.body.centers.map((x) => String(x).trim()).filter(Boolean) : [];
    const periods = Array.isArray(req.body?.periods) ? req.body.periods.map((p) => ({
      key: String(p.key || '').trim(),
      label: String(p.label || '').trim(),
      enabled: p.enabled !== false,
    })).filter((x) => x.key && x.label) : [];
    const doc = await PlatformSetting.findOneAndUpdate(
      { singleton: 'platform' },
      { singleton: 'platform', centers, periods },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, data: doc });
  } catch (e) { next(e); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const { location = 'Global', activity = 'All' } = req.query;
    let doc = await ManualKpi.findOne({ location, activity }).lean();
    if (!doc) {
      doc = {
        location,
        activity,
        totalParticipants: 0,
        womenBeneficiaries: 0,
        totalTrainings: 0,
        totalStartups: 0,
        insertionRate: 0,
        childrenSuperCodeur: 0,
        monthlyTrend: [],
        participantsByYear: []
      };
    }
    res.json({ success: true, data: doc });
  } catch (e) { next(e); }
});

router.put('/stats', async (req, res, next) => {
  try {
    const { location = 'Global', activity = 'All', ...increments } = req.body;
    
    // Prepare $inc object only for numeric fields
    const incObj = {};
    const numericFields = [
      'totalParticipants', 
      'womenBeneficiaries', 
      'totalTrainings', 
      'totalStartups', 
      'insertionRate', 
      'childrenSuperCodeur'
    ];
    
    numericFields.forEach(field => {
      if (typeof increments[field] === 'number') {
        incObj[field] = increments[field];
      }
    });

    const doc = await ManualKpi.findOneAndUpdate(
      { location, activity },
      { $inc: incObj },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    
    res.json({ success: true, data: doc });
  } catch (e) { next(e); }
});

router.delete('/stats/reset', async (_req, res, next) => {
  try {
    await ManualKpi.deleteMany({});
    res.json({ success: true, message: 'Toutes les données manuelles ont été réinitialisées.' });
  } catch (e) { next(e); }
});

export default router;
