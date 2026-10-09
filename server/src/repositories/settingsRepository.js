import UserSettings from '../models/UserSettings.js';

export const settingsRepository = {
  async findByUserId(userId) {
    let settings = await UserSettings.findOne({ userId }).exec();
    if (!settings) {
      settings = await UserSettings.create({ userId });
    }
    return settings;
  },

  async updateByUserId(userId, updateData) {
    return UserSettings.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  },
};

export default settingsRepository;
