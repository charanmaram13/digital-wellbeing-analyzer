import { Router } from 'express';
import screenTimeController from '../controllers/screenTimeController.js';
import authenticate from '../middleware/authenticate.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createScreenTimeSchema,
  updateScreenTimeSchema,
  queryScreenTimeSchema,
} from '../validators/screenTimeValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest(queryScreenTimeSchema), screenTimeController.getAll);
router.post('/', validateRequest(createScreenTimeSchema), screenTimeController.create);
router.post('/import', screenTimeController.importCSV);
router.get('/export', screenTimeController.exportCSV);
router.get('/:id', screenTimeController.getById);
router.patch('/:id', validateRequest(updateScreenTimeSchema), screenTimeController.update);
router.delete('/:id', screenTimeController.delete);

export default router;
