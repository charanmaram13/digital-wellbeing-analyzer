import recommendationRepository from '../repositories/recommendationRepository.js';
import { NotFoundError } from '../utils/errors.js';

export const recommendationService = {
  async getRecommendations(userId, status = null) {
    return recommendationRepository.findByUser(userId, status);
  },

  async updateStatus(userId, id, status) {
    const rec = await recommendationRepository.updateStatusByIdAndUser(id, userId, status);
    if (!rec) {
      throw new NotFoundError('Recommendation not found');
    }
    return rec;
  },

  async deleteRecommendation(userId, id) {
    const rec = await recommendationRepository.deleteByIdAndUser(id, userId);
    if (!rec) {
      throw new NotFoundError('Recommendation not found');
    }
    return rec;
  },
};

export default recommendationService;
