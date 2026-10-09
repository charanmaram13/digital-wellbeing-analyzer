import settingsRepository from '../repositories/settingsRepository.js';
import ApiResponse from '../utils/apiResponse.js';

export const settingsController = {
  async getSettings(req, res, next) {
    try {
      const settings = await settingsRepository.findByUserId(req.user._id);
      return ApiResponse.success(res, 200, settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const settings = await settingsRepository.updateByUserId(req.user._id, req.body);
      return ApiResponse.success(res, 200, settings);
    } catch (error) {
      next(error);
    }
  },
};

export default settingsController;
