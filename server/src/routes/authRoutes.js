import { Router } from 'express';
import authController from '../controllers/authController.js';
import validateRequest from '../middleware/validateRequest.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';
import authenticate from '../middleware/authenticate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
