import FocusSession from '../models/FocusSession.js';

export const focusSessionRepository = {
  async findByUser(userId, limit = 50) {
    return FocusSession.find({ userId }).sort({ startedAt: -1 }).limit(limit).exec();
  },

  async findActiveByUser(userId) {
    return FocusSession.findOne({ userId, status: 'in_progress' }).exec();
  },

  async findByIdAndUser(id, userId) {
    return FocusSession.findOne({ _id: id, userId }).exec();
  },

  async create(sessionData) {
    return FocusSession.create(sessionData);
  },

  async updateByIdAndUser(id, userId, updateData) {
    return FocusSession.findOneAndUpdate({ _id: id, userId }, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async countCompletedInRange(userId, startDate, endDate) {
    const filter = {
      userId,
      status: 'completed',
    };
    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) filter.startedAt.$gte = new Date(startDate);
      if (endDate) filter.startedAt.$lte = new Date(endDate);
    }
    return FocusSession.countDocuments(filter).exec();
  },
};

export default focusSessionRepository;
