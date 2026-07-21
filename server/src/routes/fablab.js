import express from 'express';
import Equipment from '../models/Equipment.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/equipment', async (req, res) => {
  const data = await Equipment.find();
  res.json({ success: true, data });
});

router.post('/usage', async (req, res) => {
  const { equipmentId, usageData } = req.body;
  const eq = await Equipment.findByIdAndUpdate(
    equipmentId, 
    { $push: { usageHistory: usageData } },
    { new: true }
  );
  res.json({ success: true, data: eq });
});

export default router;
