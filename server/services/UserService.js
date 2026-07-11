const mongoose = require("mongoose");
const User = require("../models/User");
const DoctorService = require("../services/DoctorService");
const { ConflictError } = require("../utils/error");

class UserService {
  static async createUser(data) {
    try {
      const existingUser = await User.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError("Email already registered");
      }

      if (data.role === "doctor") {
        // Delegate to DoctorService to handle doctor details
        return await DoctorService.create(data);
      }

      // Create standard user
      const user = new User({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      await user.save();
      return user.getPublicProfile();
    } catch (error) {
      throw error;
    }
  }

  static async getUsers(role = "") {
    try {
      const query = { isActive: true };
      if (role) query.role = role;

      const users = await User.find(query)
        .select("-password -refreshTokens")
        .sort({ createdAt: -1 });
      return users;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
