import express from 'express';
import CoworkingSpace from '../models/CoworkingSpace.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate);

const DEFAULT_SPACES = [
  {
    name: 'Open Space Rabat',
    city: 'Rabat',
    location: 'Orange Digital Center, Technopolis Rabat-Salé',
    description: 'Espace de coworking ouvert dédié aux porteurs de projets, freelances et startups accompagnées par ODC.',
    capacity: 60,
    occupied: 38,
    amenities: ['Wi-Fi fibre', 'Salles de réunion', 'Imprimante 3D', 'Café'],
    openingHours: '09h00 - 19h00',
    status: 'open',
  },
  {
    name: 'Hub Créatif Agadir',
    city: 'Agadir',
    location: 'Orange Digital Center Agadir',
    description: 'Espace collaboratif pour les communautés tech et les startups de la région Souss-Massa.',
    capacity: 40,
    occupied: 22,
    amenities: ['Wi-Fi fibre', 'Espace détente', 'Salle de formation'],
    openingHours: '09h00 - 18h00',
    status: 'open',
  },
  {
    name: 'Espace Startups Casablanca',
    city: 'Casablanca',
    location: 'Orange Digital Center Casablanca',
    description: 'Bureaux partagés et postes nomades pour les startups en phase d’accélération.',
    capacity: 50,
    occupied: 50,
    amenities: ['Wi-Fi fibre', 'Bureaux privatifs', 'Salles de réunion', 'Phone booths'],
    openingHours: '08h30 - 20h00',
    status: 'full',
  },
];

async function ensureSeed() {
  const count = await CoworkingSpace.estimatedDocumentCount();
  if (count === 0) {
    await CoworkingSpace.insertMany(DEFAULT_SPACES);
  }
}

router.get('/', async (req, res, next) => {
  try {
    await ensureSeed();
    const data = await CoworkingSpace.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/', authorize('super_admin', 'manager', 'coordinator', 'member'), async (req, res, next) => {
  try {
    const space = await CoworkingSpace.create(req.body);
    res.status(201).json({ success: true, data: space });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', authorize('super_admin', 'manager', 'coordinator', 'member'), async (req, res, next) => {
  try {
    const space = await CoworkingSpace.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!space) throw new AppError('Espace introuvable', 404);
    res.json({ success: true, data: space });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authorize('super_admin', 'manager', 'coordinator'), async (req, res, next) => {
  try {
    const space = await CoworkingSpace.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!space) throw new AppError('Espace introuvable', 404);
    res.json({ success: true, data: space });
  } catch (e) {
    next(e);
  }
});

export default router;
