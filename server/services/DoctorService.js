const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const { ConflictError, NotFoundError } = require("../utils/error");

class DoctorService {
  static async create(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingUser = await User.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError("Email already registered");
      }

      // Create base User with role 'doctor'
      const user = new User({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "doctor",
      });

      await user.save({ session });

      // Create associated Doctor profile
      const doctor = new Doctor({
        user: user._id,
        department: data.department,
        specialization: data.specialization,
        qualification: data.qualification,
        phone: data.phone,
      });

      await doctor.save({ session });

      await session.commitTransaction();
      session.endSession();

      const populated = await Doctor.findById(doctor._id).populate(
        "user",
        "name email role isActive",
      );
      return populated;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getAll(department = "") {
    try {
      const query = { isActive: true };
      if (department) {
        query.department = { $regex: department, $options: "i" };
      }

      const doctors = await Doctor.find(query)
        .populate("user", "name email role isActive")
        .sort({ createdAt: -1 });

      return doctors;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const doctor = await Doctor.findById(id).populate(
        "user",
        "name email role isActive",
      );
      if (!doctor) {
        throw new NotFoundError("Doctor not found");
      }
      return doctor;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DoctorService;
