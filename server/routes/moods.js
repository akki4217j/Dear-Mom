import express from 'express';
import { getMoods, saveMood, getMoodStats, getPartnerMoods } from '../controllers/moodController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMoods);
router.post('/', saveMood);
router.get('/stats', getMoodStats);
router.get('/partner', getPartnerMoods);

export default router;
