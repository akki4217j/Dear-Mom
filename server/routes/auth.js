import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword, linkPartner } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/link-partner', protect, linkPartner);

export default router;
