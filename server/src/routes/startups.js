import express from 'express';
import Startup from '../models/Startup.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const data = await Startup.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const startup = await Startup.create(req.body);
  res.status(201).json({ success: true, data: startup });
});

export default router;
