import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import userRepository from '../repositories/userRepository.js';
import settingsRepository from '../repositories/settingsRepository.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';

export const authService = {
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      name,
      email,
      passwordHash,
    });

    // Create default user settings
    await settingsRepository.findByUserId(user._id);

    const token = this.generateToken(user._id);
    return { user, token };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = this.generateToken(user._id);
    const safeUser = await userRepository.findById(user._id);
    return { user: safeUser, token };
  },

  generateToken(userId) {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: '7d',
    });
  },

  setAuthCookie(res, token) {
    const isProd = env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE ?? isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  },

  clearAuthCookie(res) {
    const isProd = env.NODE_ENV === 'production';
    res.cookie('token', '', {
      httpOnly: true,
      secure: env.COOKIE_SECURE ?? isProd,
      sameSite: isProd ? 'none' : 'lax',
      expires: new Date(0),
      path: '/',
    });
  },
};

export default authService;
