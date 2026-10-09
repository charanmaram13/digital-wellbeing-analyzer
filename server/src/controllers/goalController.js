import goalRepository from '../repositories/goalRepository.js';
import ApiResponse from '../utils/apiResponse.js';
import { NotFoundError } from '../utils/errors.js';

export const goalController = {
  async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const goals = await goalRepository.findByUser(req.user._id, status);
      return ApiResponse.success(res, 200, goals);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const goal = await goalRepository.create({
        ...req.body,
        userId: req.user._id,
      });
      return ApiResponse.success(res, 201, goal);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const goal = await goalRepository.updateByIdAndUser(req.params.id, req.user._id, req.body);
      if (!goal) {
        throw new NotFoundError('Goal not found');
      }
      return ApiResponse.success(res, 200, goal);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const goal = await goalRepository.deleteByIdAndUser(req.params.id, req.user._id);
      if (!goal) {
        throw new NotFoundError('Goal not found');
      }
      return ApiResponse.success(res, 200, { message: 'Goal removed successfully' });
    } catch (error) {
      next(error);
    }
  },
};

export default goalController;
