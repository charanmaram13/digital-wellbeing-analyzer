import insightService from '../ai/insightService.js';
import dashboardService from '../services/dashboardService.js';
import recommendationService from '../services/recommendationService.js';
import ApiResponse from '../utils/apiResponse.js';

export const insightController = {
  async generate(req, res, next) {
    try {
      const overview = await dashboardService.getOverview(req.user._id);
      const insights = await insightService.generateUserInsights(req.user._id, overview);
      return ApiResponse.success(res, 200, insights);
    } catch (error) {
      next(error);
    }
  },

  async getRecommendations(req, res, next) {
    try {
      const { status } = req.query;
      const list = await recommendationService.getRecommendations(req.user._id, status);
      return ApiResponse.success(res, 200, list);
    } catch (error) {
      next(error);
    }
  },

  async updateRecommendationStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await recommendationService.updateStatus(req.user._id, req.params.id, status);
      return ApiResponse.success(res, 200, updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteRecommendation(req, res, next) {
    try {
      await recommendationService.deleteRecommendation(req.user._id, req.params.id);
      return ApiResponse.success(res, 200, { message: 'Recommendation dismissed' });
    } catch (error) {
      next(error);
    }
  },
};

export default insightController;
