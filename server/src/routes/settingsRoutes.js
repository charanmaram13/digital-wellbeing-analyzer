import { Router } from 'express';
import settingsController from '../controllers/settingsController.js';
import authenticate from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import { updateSettingsSchema } from '../validators/settingsValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.patch('/', validateRequest(updateSettingsSchema), settingsController.updateSettings);

export default router;
