import express from 'express';
import { analyzeDropoutRisk, predictInsertionSuccess } from '../utils/aiPrediction.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);
router.use(authorize('super_admin', 'entity_manager'));

router.post('/run-dropout-analysis', async (req, res, next) => {
  try {
    const alertCount = await analyzeDropoutRisk();
    res.json({ success: true, message: `Analyse terminée. ${alertCount} alertes générées.` });
  } catch(e) { next(e); }
});

router.get('/score/:participantId', async (req, res, next) => {
  try {
    const score = await predictInsertionSuccess(req.params.participantId);
    res.json({ success: true, data: { score } });
  } catch(e) { next(e); }
});

export default router;
