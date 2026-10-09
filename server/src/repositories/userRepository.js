import User from '../models/User.js';

export const userRepository = {
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  },

  async findById(id) {
    return User.findById(id).exec();
  },

  async create(userData) {
    return User.create({
      ...userData,
      email: userData.email.toLowerCase().trim(),
    });
  },

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  },
};

export default userRepository;
