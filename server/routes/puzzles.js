import express from 'express';
import {
  getAllPuzzles,
  getRandomPuzzle,
  startGame,
  getSession,
  getSessions,
  placeMove,
} from '../controllers/puzzleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllPuzzles);
router.get('/random', getRandomPuzzle);
router.post('/start-game', startGame);
router.get('/sessions', getSessions);
router.get('/session/:id', getSession);
router.post('/session/:id/move', placeMove);

export default router;
