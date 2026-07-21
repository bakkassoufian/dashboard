import express from 'express';
import Platform from '../models/Platform.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate);

const DEFAULT_PLATFORMS = [
  {
    name: 'ODC Learning',
    description: 'Plateforme d’apprentissage en ligne d’Orange Digital Center : cours, parcours et ressources pédagogiques accessibles à tous.',
    url: 'https://www.odc-learning.com/',
    category: 'Formation',
    status: 'live',
    tags: ['E-learning', 'Cours', 'Parcours'],
    launchYear: 2025,
  },
  {
    name: 'ODC IA Lab — Portail Immersif',
    description: 'Portail immersif du FabLab : expériences en réalité virtuelle et exploration des usages de l’intelligence artificielle.',
    url: 'https://fablab-vr.vercel.app/',
    category: 'Formation',
    status: 'live',
    tags: ['VR', 'Immersif', 'IA', 'FabLab'],
    launchYear: 2026,
  },
  {
    name: 'Career Booster',
    description: 'Outil d’accompagnement à l’employabilité : préparation des candidatures, coaching et mise en relation avec les opportunités.',
    url: 'https://career-booster-rosy.vercel.app/',
    category: 'Employabilité',
    status: 'live',
    tags: ['Emploi', 'Carrière', 'Coaching'],
    launchYear: 2026,
  },
  {
    name: 'Miniapp Learning Platform',
    description: 'Plateforme d’apprentissage légère et mobile pour suivre des micro-formations et des contenus interactifs.',
    url: 'https://miniapp-front-pi.vercel.app/',
    category: 'Formation',
    status: 'live',
    tags: ['Micro-learning', 'Mobile', 'Interactif'],
    launchYear: 2026,
  },
  {
    name: 'Fixify',
    description: 'Plateforme d’automatisation IT native IA : automatisation des demandes de support et des workflows internes.',
    url: 'https://www.fixify.com/',
    category: 'Outil interne',
    status: 'live',
    tags: ['Automatisation', 'IA', 'Support IT'],
    launchYear: 2026,
  },
];

async function ensureSeed() {
  const count = await Platform.estimatedDocumentCount();
  if (count === 0) {
    await Platform.insertMany(DEFAULT_PLATFORMS);
  }
}

router.get('/', async (req, res, next) => {
  try {
    await ensureSeed();
    const data = await Platform.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/', authorize('super_admin', 'manager', 'coordinator'), async (req, res, next) => {
  try {
    const platform = await Platform.create(req.body);
    res.status(201).json({ success: true, data: platform });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', authorize('super_admin', 'manager', 'coordinator'), async (req, res, next) => {
  try {
    const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!platform) throw new AppError('Plateforme introuvable', 404);
    res.json({ success: true, data: platform });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authorize('super_admin', 'manager', 'coordinator'), async (req, res, next) => {
  try {
    const platform = await Platform.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!platform) throw new AppError('Plateforme introuvable', 404);
    res.json({ success: true, data: platform });
  } catch (e) {
    next(e);
  }
});

export default router;
