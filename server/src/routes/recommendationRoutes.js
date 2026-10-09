import { Router } from 'express';
import insightController from '../controllers/insightController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', insightController.getRecommendations);
router.patch('/:id', insightController.updateRecommendationStatus);
router.delete('/:id', insightController.deleteRecommendation);

export default router;
