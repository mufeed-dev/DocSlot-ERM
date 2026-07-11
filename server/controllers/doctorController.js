const BaseController = require("./BaseController");
const DoctorService = require("../services/DoctorService");
const { doctorValidation } = require("../utils/validation");

class DoctorController extends BaseController {
  static create = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      req.body,
      doctorValidation,
    );

    const doctor = await DoctorService.create(validatedData);

    BaseController.logAction("DOCTOR_CREATED", {
      user: req.user,
      entity: "Doctor",
      entityId: doctor._id,
      ipAddress: req.ip,
      email: validatedData.email,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      "Doctor created successfully",
      doctor,
      201,
    );
  });

  static getAll = BaseController.asyncHandler(async (req, res) => {
    const { department } = req.query;

    const doctors = await DoctorService.getAll(department);

    BaseController.sendSuccessResponse(
      res,
      "Doctors retrieved successfully",
      doctors,
    );
  });

  static getById = BaseController.asyncHandler(async (req, res) => {
    const doctor = await DoctorService.getById(req.params.id);

    BaseController.sendSuccessResponse(
      res,
      "Doctor details retrieved successfully",
      doctor,
    );
  });
}

module.exports = DoctorController;
