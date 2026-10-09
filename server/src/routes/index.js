import { Router } from 'express';
import authRoutes from './authRoutes.js';
import screenTimeRoutes from './screenTimeRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import insightRoutes from './insightRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import goalRoutes from './goalRoutes.js';
import focusRoutes from './focusRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/screen-time', screenTimeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/insights', insightRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/goals', goalRoutes);
router.use('/focus-sessions', focusRoutes);
router.use('/settings', settingsRoutes);

export default router;
