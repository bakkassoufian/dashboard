import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate);

const DEFAULT_BROADCASTS = [
  {
    audience: 'all',
    title: 'Bienvenue sur ODC Ecosystem',
    message: 'Retrouvez ici toutes les notifications liées à vos formations, événements et activités.',
    type: 'success',
  },
  {
    audience: 'all',
    title: 'Nouveau : Espaces de coworking',
    message: 'Consultez la disponibilité des espaces de coworking ODC depuis le menu Coworking.',
    type: 'info',
    link: '/coworking',
  },
];

async function ensureSeed() {
  const count = await Notification.estimatedDocumentCount();
  if (count === 0) {
    await Notification.insertMany(DEFAULT_BROADCASTS);
  }
}

/** Filtre Mongo : notifications visibles par l'utilisateur courant. */
function visibilityQuery(user) {
  return {
    $or: [
      { userId: user._id },
      { audience: 'all' },
      { audience: user.role },
    ],
  };
}

/** Notification a-t-elle été lue par cet utilisateur ? (perso = read, diffusée = readBy) */
function isReadByUser(notif, userId) {
  if (notif.userId && String(notif.userId) === String(userId)) return notif.read;
  return (notif.readBy || []).some((id) => String(id) === String(userId));
}

router.get('/', async (req, res, next) => {
  try {
    await ensureSeed();
    const docs = await Notification.find(visibilityQuery(req.user))
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const data = docs.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link,
      createdAt: n.createdAt,
      read: isReadByUser(n, req.user._id),
    }));
    const unreadCount = data.filter((n) => !n.read).length;
    res.json({ success: true, data, unreadCount });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      ...visibilityQuery(req.user),
    });
    if (!notif) throw new AppError('Notification introuvable', 404);
    if (notif.userId && String(notif.userId) === String(req.user._id)) {
      notif.read = true;
    } else if (!notif.readBy.some((id) => String(id) === String(req.user._id))) {
      notif.readBy.push(req.user._id);
    }
    await notif.save();
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    const docs = await Notification.find(visibilityQuery(req.user));
    await Promise.all(
      docs.map((notif) => {
        if (notif.userId && String(notif.userId) === String(req.user._id)) {
          notif.read = true;
        } else if (!notif.readBy.some((id) => String(id) === String(req.user._id))) {
          notif.readBy.push(req.user._id);
        }
        return notif.save();
      }),
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post('/', authorize('super_admin', 'manager', 'coordinator'), async (req, res, next) => {
  try {
    const { title, message, type, link, userId, audience } = req.body;
    if (!title) throw new AppError('Le titre est obligatoire', 400);
    const notif = await Notification.create({
      title,
      message,
      type,
      link,
      userId: userId || undefined,
      audience: userId ? undefined : (audience || 'all'),
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: notif });
  } catch (e) {
    next(e);
  }
});

export default router;
