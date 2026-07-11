const AuditLog = require("../models/AuditLog");
const logger = require("../utils/logger");

class AuditService {
  static async log(data) {
    try {
      const log = new AuditLog({
        user: data.user || null,
        role: data.role || "system",
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        details: data.details || {},
        ipAddress: data.ipAddress || "",
      });

      await log.save();
      logger.info(`Audit Log Saved: ${data.action} on ${data.entity}`);
    } catch (error) {
      logger.error("Failed to write audit log to database:", error.message);
    }
  }

  static async getLogs({ page = 1, limit = 50 }) {
    try {
      const query = {
        action: { $nin: ["USER_LOGGED_IN", "USER_LOGGED_OUT", "TOKEN_REFRESHED"] }
      };
      const skip = (page - 1) * limit;
      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate("user", "name email role")
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(query),
      ]);

      return {
        logs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuditService;
