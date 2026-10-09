import { Router } from 'express';
import insightController from '../controllers/insightController.js';
import authenticate from '../middleware/authenticate.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/generate', aiRateLimiter, insightController.generate);
router.get('/recommendations', insightController.getRecommendations);
router.patch('/recommendations/:id', insightController.updateRecommendationStatus);
router.delete('/recommendations/:id', insightController.deleteRecommendation);

export default router;
