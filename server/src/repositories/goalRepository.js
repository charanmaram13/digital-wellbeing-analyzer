import Goal from '../models/Goal.js';

export const goalRepository = {
  async findByUser(userId, status = null) {
    const filter = { userId };
    if (status) filter.status = status;
    return Goal.find(filter).sort({ createdAt: -1 }).exec();
  },

  async findByIdAndUser(id, userId) {
    return Goal.findOne({ _id: id, userId }).exec();
  },

  async create(goalData) {
    return Goal.create(goalData);
  },

  async updateByIdAndUser(id, userId, updateData) {
    return Goal.findOneAndUpdate({ _id: id, userId }, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async deleteByIdAndUser(id, userId) {
    return Goal.findOneAndDelete({ _id: id, userId }).exec();
  },
};

export default goalRepository;
