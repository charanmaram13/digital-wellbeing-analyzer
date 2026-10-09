import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import userRepository from '../repositories/userRepository.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization Header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired authentication token.');
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User account associated with token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export default authenticate;
