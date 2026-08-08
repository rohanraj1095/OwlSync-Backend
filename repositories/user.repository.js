import User from "../models/user.model.js";

export class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async create(userData) {
    return await User.create(userData);
  }

  async findById(userId) {
    return await User.findById(userId);
  }
}

export default new UserRepository();
