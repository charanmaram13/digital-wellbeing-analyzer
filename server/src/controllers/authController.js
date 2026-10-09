import authService from '../services/authService.js';
import ApiResponse from '../utils/apiResponse.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);
      authService.setAuthCookie(res, token);
      return ApiResponse.success(res, 201, { user });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      authService.setAuthCookie(res, token);
      return ApiResponse.success(res, 200, { user });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      authService.clearAuthCookie(res);
      return ApiResponse.success(res, 200, { message: 'Successfully logged out' });
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      return ApiResponse.success(res, 200, { user: req.user });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
