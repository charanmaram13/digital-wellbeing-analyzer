import dashboardService from '../services/dashboardService.js';
import wellbeingScoreService from '../services/wellbeingScoreService.js';
import ApiResponse from '../utils/apiResponse.js';

export const analyticsController = {
  async getOverview(req, res, next) {
    try {
      const data = await dashboardService.getOverview(req.user._id);
      return ApiResponse.success(res, 200, data);
    } catch (error) {
      next(error);
    }
  },

  async getDaily(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await dashboardService.getDailyAnalytics(req.user._id, startDate, endDate);
      return ApiResponse.success(res, 200, data);
    } catch (error) {
      next(error);
    }
  },

  async getWeekly(req, res, next) {
    try {
      const data = await dashboardService.getWeeklyAnalytics(req.user._id);
      return ApiResponse.success(res, 200, data);
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await dashboardService.getCategoryAnalytics(req.user._id, startDate, endDate);
      return ApiResponse.success(res, 200, data);
    } catch (error) {
      next(error);
    }
  },

  async getPatterns(req, res, next) {
    try {
      const data = await dashboardService.getPatternAnalytics(req.user._id);
      return ApiResponse.success(res, 200, data);
    } catch (error) {
      next(error);
    }
  },

  async getWellbeingScore(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await wellbeingScoreService.getScore(req.user._id, startDate, endDate);
      return ApiResponse.success(res, 200, data);
    } catch (error) {
      next(error);
    }
  },
};

export default analyticsController;
