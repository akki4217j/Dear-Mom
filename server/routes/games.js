import express from 'express';
import { getLikedNames, addLikedName, getQuizAnswers, saveQuizAnswers, resetQuizAnswers } from '../controllers/gameController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/liked-names', getLikedNames);
router.post('/liked-names', addLikedName);
router.get('/quiz-answers', getQuizAnswers);
router.post('/quiz-answers', saveQuizAnswers);
router.delete('/quiz-answers', resetQuizAnswers);

export default router;
