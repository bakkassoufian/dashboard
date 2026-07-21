import express from 'express';
import Satisfaction from '../models/Satisfaction.js';
import { authenticate } from '../middleware/auth.js';
import { managerReadOnly } from '../middleware/rbac.js';

const router = express.Router();
router.use(authenticate);
router.use(managerReadOnly);

router.get('/stats', async (req, res) => {
  const stats = await Satisfaction.aggregate([
    { 
      $group: { 
        _id: null, 
        avgContenu: { $avg: "$ratingContenu" },
        avgFormateur: { $avg: "$ratingFormateur" },
        avgLogistique: { $avg: "$ratingLogistique" },
        total: { $sum: 1 }
      } 
    }
  ]);
  res.json({ success: true, data: stats[0] || {} });
});

router.post('/submit', async (req, res) => {
  const feedback = await Satisfaction.create(req.body);
  res.status(201).json({ success: true, data: feedback });
});

export default router;
