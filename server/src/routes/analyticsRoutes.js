import { Router } from 'express';
import analyticsController from '../controllers/analyticsController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/daily', analyticsController.getDaily);
router.get('/weekly', analyticsController.getWeekly);
router.get('/categories', analyticsController.getCategories);
router.get('/patterns', analyticsController.getPatterns);
router.get('/wellbeing-score', analyticsController.getWellbeingScore);

export default router;
