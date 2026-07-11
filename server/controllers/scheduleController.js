const BaseController = require("./BaseController");
const ScheduleService = require("../services/ScheduleService");
const { scheduleValidation } = require("../utils/validation");

class ScheduleController extends BaseController {
  static createOrUpdate = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      req.body,
      scheduleValidation,
    );

    const schedule = await ScheduleService.createOrUpdate(validatedData);

    BaseController.logAction("SCHEDULE_CONFIGURED", {
      doctorId: validatedData.doctor,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      "Doctor schedule configured successfully",
      schedule,
      200,
    );
  });

  static getByDoctor = BaseController.asyncHandler(async (req, res) => {
    const schedule = await ScheduleService.getByDoctor(req.params.doctorId);

    BaseController.sendSuccessResponse(
      res,
      "Doctor schedule retrieved successfully",
      schedule,
    );
  });
}

module.exports = ScheduleController;
