import express from 'express';
import { getMemories, createMemory, deleteMemory } from '../controllers/memoryController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getMemories);
router.post('/', upload.single('photo'), createMemory);
router.delete('/:id', deleteMemory);

export default router;
