const BaseController = require("./BaseController");
const SlotService = require("../services/SlotService");
const { ValidationError } = require("../utils/error");

class SlotController extends BaseController {
  static getSlots = BaseController.asyncHandler(async (req, res) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      throw new ValidationError(
        "Doctor ID and Date are required query parameters",
      );
    }

    const slots = await SlotService.generateSlots(doctorId, date);

    BaseController.sendSuccessResponse(
      res,
      "Available slots retrieved successfully",
      slots,
    );
  });
}

module.exports = SlotController;
