import ScreenTimeRecord from '../models/ScreenTimeRecord.js';

export const screenTimeRepository = {
  async findByIdAndUser(id, userId) {
    return ScreenTimeRecord.findOne({ _id: id, userId }).exec();
  },

  async findByUserAndDateRange(userId, startDate, endDate, category = null) {
    const filter = { userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }
    if (category) {
      filter.category = category;
    }
    return ScreenTimeRecord.find(filter).sort({ date: -1, durationMinutes: -1 }).exec();
  },

  async findWithPagination(userId, { startDate, endDate, category, source, page = 1, limit = 50 }) {
    const filter = { userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }
    if (category) filter.category = category;
    if (source) filter.source = source;

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      ScreenTimeRecord.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      ScreenTimeRecord.countDocuments(filter).exec(),
    ]);

    return {
      records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async create(recordData) {
    return ScreenTimeRecord.create(recordData);
  },

  async insertMany(records) {
    return ScreenTimeRecord.insertMany(records, { ordered: false });
  },

  async updateByIdAndUser(id, userId, updateData) {
    return ScreenTimeRecord.findOneAndUpdate({ _id: id, userId }, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async deleteByIdAndUser(id, userId) {
    return ScreenTimeRecord.findOneAndDelete({ _id: id, userId }).exec();
  },

  async findExistingSignatures(userId, signatures) {
    // signatures is array of { date, applicationName, startTime }
    if (!signatures.length) return [];
    return ScreenTimeRecord.find({
      userId,
      $or: signatures.map((s) => ({
        date: s.date,
        applicationName: s.applicationName,
        startTime: s.startTime || null,
      })),
    })
      .select('date applicationName startTime')
      .lean()
      .exec();
  },

  async deleteDemoRecords(userId) {
    return ScreenTimeRecord.deleteMany({ userId, source: 'demo' }).exec();
  },
};

export default screenTimeRepository;
