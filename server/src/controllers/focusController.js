import focusSessionRepository from '../repositories/focusSessionRepository.js';
import ApiResponse from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

export const focusController = {
  async getAll(req, res, next) {
    try {
      const sessions = await focusSessionRepository.findByUser(req.user._id);
      return ApiResponse.success(res, 200, sessions);
    } catch (error) {
      next(error);
    }
  },

  async getActive(req, res, next) {
    try {
      const active = await focusSessionRepository.findActiveByUser(req.user._id);
      return ApiResponse.success(res, 200, active);
    } catch (error) {
      next(error);
    }
  },

  async start(req, res, next) {
    try {
      const session = await focusSessionRepository.create({
        userId: req.user._id,
        plannedDurationMinutes: req.body.plannedDurationMinutes || 25,
        notes: req.body.notes || '',
        status: 'in_progress',
        startedAt: new Date(),
      });
      return ApiResponse.success(res, 201, session);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (updateData.status === 'completed' || updateData.status === 'cancelled') {
        updateData.completedAt = new Date();
      }

      const session = await focusSessionRepository.updateByIdAndUser(
        req.params.id,
        req.user._id,
        updateData
      );
      if (!session) {
        throw new NotFoundError('Focus session not found');
      }
      return ApiResponse.success(res, 200, session);
    } catch (error) {
      next(error);
    }
  },
};

export default focusController;
