const BaseController = require("./BaseController");
const AuditService = require("../services/AuditService");

class AuditController extends BaseController {
  static getLogs = BaseController.asyncHandler(async (req, res) => {
    const { page, limit } = req.query;

    const result = await AuditService.getLogs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });

    BaseController.sendPaginatedResponse(
      res,
      result.logs,
      result.pagination,
      "Audit logs retrieved successfully",
    );
  });
}

module.exports = AuditController;
