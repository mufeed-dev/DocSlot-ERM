const BaseController = require("./BaseController");
const PatientService = require("../services/PatientService");
const { patientValidation } = require("../utils/validation");

class PatientController extends BaseController {
  static create = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      req.body,
      patientValidation,
    );

    const patient = await PatientService.create(validatedData);

    BaseController.logAction("PATIENT_CREATED", {
      patientId: patient._id,
      patientCustomId: patient.patientId,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      "Patient created successfully",
      patient,
      201,
    );
  });

  static search = BaseController.asyncHandler(async (req, res) => {
    const { query } = req.query;

    const patients = await PatientService.search(query);

    BaseController.sendSuccessResponse(
      res,
      "Patients searched successfully",
      patients,
    );
  });
}

module.exports = PatientController;
