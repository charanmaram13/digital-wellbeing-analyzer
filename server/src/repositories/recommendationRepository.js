import Recommendation from '../models/Recommendation.js';

export const recommendationRepository = {
  async findByUser(userId, status = null) {
    const filter = { userId };
    if (status) filter.status = status;
    return Recommendation.find(filter).sort({ createdAt: -1 }).exec();
  },

  async findByIdAndUser(id, userId) {
    return Recommendation.findOne({ _id: id, userId }).exec();
  },

  async create(recData) {
    return Recommendation.create(recData);
  },

  async insertMany(records) {
    return Recommendation.insertMany(records);
  },

  async updateStatusByIdAndUser(id, userId, status) {
    return Recommendation.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status } },
      { new: true, runValidators: true }
    ).exec();
  },

  async deleteByIdAndUser(id, userId) {
    return Recommendation.findOneAndDelete({ _id: id, userId }).exec();
  },
};

export default recommendationRepository;
