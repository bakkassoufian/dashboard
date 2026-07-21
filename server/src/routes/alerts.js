import express from 'express';
import Alert from '../models/Alert.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const data = await Alert.find({ isRead: false }).sort({ createdAt: -1 });
  res.json({ success: true, data });
});

router.patch('/:id/read', async (req, res) => {
  await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true, message: 'Alert marked as read' });
});

export default router;
