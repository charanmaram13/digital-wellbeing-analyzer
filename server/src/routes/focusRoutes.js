import { Router } from 'express';
import focusController from '../controllers/focusController.js';
import authenticate from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import { startFocusSchema, updateFocusSchema } from '../validators/focusValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', focusController.getAll);
router.get('/active', focusController.getActive);
router.post('/', validateRequest(startFocusSchema), focusController.start);
router.patch('/:id', validateRequest(updateFocusSchema), focusController.update);

export default router;
