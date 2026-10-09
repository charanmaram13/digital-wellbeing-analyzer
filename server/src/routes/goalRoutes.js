import { Router } from 'express';
import goalController from '../controllers/goalController.js';
import authenticate from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import { createGoalSchema, updateGoalSchema } from '../validators/goalValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', goalController.getAll);
router.post('/', validateRequest(createGoalSchema), goalController.create);
router.patch('/:id', validateRequest(updateGoalSchema), goalController.update);
router.delete('/:id', goalController.delete);

export default router;
