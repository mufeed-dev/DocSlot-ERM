const BaseController = require("./BaseController");
const AppointmentService = require("../services/AppointmentService");
const Doctor = require("../models/Doctor");
const {
  appointmentValidation,
  appointmentUpdateValidation,
} = require("../utils/validation");
const { AuthorizationError, NotFoundError } = require("../utils/error");

class AppointmentController extends BaseController {
  static create = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      req.body,
      appointmentValidation,
    );

    const appointment = await AppointmentService.create(
      validatedData,
      req.user._id,
    );

    BaseController.logAction("APPOINTMENT_CREATED", {
      user: req.user,
      entity: "Appointment",
      entityId: appointment._id,
      ipAddress: req.ip,
      patientId: appointment.patient._id,
      doctorId: appointment.doctor._id,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      "Appointment booked successfully",
      appointment,
      201,
    );
  });

  static getAll = BaseController.asyncHandler(async (req, res) => {
    let {
      page,
      limit,
      sort,
      doctorId,
      patientId,
      department,
      status,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    // Doctors can only view their own appointments
    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (!doctorProfile) {
        throw new NotFoundError("Associated Doctor profile not found");
      }
      doctorId = doctorProfile._id.toString();
    }

    const result = await AppointmentService.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
      sort: sort || "-createdAt",
      doctorId,
      patientId,
      department,
      status,
      dateFrom,
      dateTo,
      search,
    });

    BaseController.sendPaginatedResponse(
      res,
      result.appointments,
      result.pagination,
      "Appointments retrieved successfully",
    );
  });

  static getById = BaseController.asyncHandler(async (req, res) => {
    const appointment = await AppointmentService.getById(req.params.id);

    // Doctor can only view their own appointments
    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (
        !doctorProfile ||
        doctorProfile._id.toString() !== appointment.doctor._id.toString()
      ) {
        throw new AuthorizationError(
          "Access denied. You can only view your own appointments.",
        );
      }
    }

    BaseController.sendSuccessResponse(
      res,
      "Appointment details retrieved successfully",
      appointment,
    );
  });

  static update = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      req.body,
      appointmentUpdateValidation,
    );

    const appointment = await AppointmentService.getById(req.params.id);

    // RBAC checks for updates
    if (req.user.role === "doctor") {
      // Doctor can only update notes/purpose for their own appointment
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (
        !doctorProfile ||
        doctorProfile._id.toString() !== appointment.doctor._id.toString()
      ) {
        throw new AuthorizationError(
          "Access denied. You can only update your own appointments.",
        );
      }

      // Doctors can only update purpose/notes, not status
      if (validatedData.status) {
        throw new AuthorizationError(
          "Access denied. Doctors cannot update appointment statuses.",
        );
      }
    }

    const updated = await AppointmentService.update(
      req.params.id,
      validatedData,
    );

    BaseController.logAction("APPOINTMENT_UPDATED", {
      user: req.user,
      entity: "Appointment",
      entityId: updated._id,
      ipAddress: req.ip,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      "Appointment updated successfully",
      updated,
    );
  });

  static cancel = BaseController.asyncHandler(async (req, res) => {
    const { reason } = req.body;

    // Doctors cannot cancel appointments per receptionist/superadmin requirements
    if (req.user.role === "doctor") {
      throw new AuthorizationError(
        "Access denied. Doctors cannot cancel appointments.",
      );
    }

    const cancelled = await AppointmentService.cancel(req.params.id, reason);

    BaseController.logAction("APPOINTMENT_CANCELLED", {
      user: req.user,
      entity: "Appointment",
      entityId: cancelled._id,
      ipAddress: req.ip,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      "Appointment cancelled successfully",
      cancelled,
    );
  });

  static markArrived = BaseController.asyncHandler(async (req, res) => {
    // Mark as arrived: Receptionist and Super Admin only
    if (req.user.role === "doctor") {
      throw new AuthorizationError(
        "Access denied. Doctors cannot mark patients as arrived.",
      );
    }

    const arrived = await AppointmentService.markArrived(req.params.id);

    BaseController.logAction("PATIENT_MARKED_ARRIVED", {
      user: req.user,
      entity: "Appointment",
      entityId: arrived._id,
      ipAddress: req.ip,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      "Patient marked as arrived successfully",
      arrived,
    );
  });
}

module.exports = AppointmentController;
