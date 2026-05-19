import express from 'express';
import { getTasksByDate, saveTasksByDate, getWeeklyStats, getTaskStreak } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats/week', getWeeklyStats);
router.get('/stats/streak', getTaskStreak);
router.get('/:date', getTasksByDate);
router.put('/:date', saveTasksByDate);

export default router;
