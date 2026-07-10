const User = require("../models/User");
const config = require("../config/config");
const logger = require("./logger");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: config.ADMIN.EMAIL });

    if (existingAdmin) {
      logger.info("Default Super Admin already exists");
      return;
    }

    const adminUser = new User({
      name: config.ADMIN.NAME,
      email: config.ADMIN.EMAIL,
      password: config.ADMIN.PASSWORD,
      role: "superadmin",
    });

    await adminUser.save();
    logger.info(
      `Default Super Admin seeded successfully: ${config.ADMIN.EMAIL}`,
    );
  } catch (error) {
    logger.error(`Error seeding Super Admin: ${error.message}`);
  }
};

module.exports = { seedAdmin };
