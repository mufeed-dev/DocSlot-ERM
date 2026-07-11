const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const PatientService = require("./PatientService");
const SlotService = require("./SlotService");
const { emitAppointmentEvent } = require("../utils/socket");
const {
  ValidationError,
  ConflictError,
  NotFoundError,
} = require("../utils/error");

class AppointmentService {
  static async create(data, bookedByUserId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Resolve Patient
      let patientId;
      if (typeof data.patient === "string") {
        const patient = await Patient.findById(data.patient);
        if (!patient) {
          throw new NotFoundError("Patient not found");
        }
        patientId = patient._id;
      } else {
        // Create new patient record
        const newPatient = await PatientService.create(data.patient);
        patientId = newPatient._id;
      }

      // 2. Resolve Doctor
      const doctor = await Doctor.findById(data.doctor);
      if (!doctor || !doctor.isActive) {
        throw new NotFoundError("Doctor profile not found or inactive");
      }

      // 3. Normalize Date (Strip time parts to compare dates correctly)
      const targetDate = new Date(data.date);
      targetDate.setHours(0, 0, 0, 0);

      // 4. Validate Slot Availability dynamically
      const slots = await SlotService.generateSlots(
        doctor._id,
        targetDate.toISOString(),
      );
      const slot = slots.find((s) => s.time === data.slotTime);

      if (!slot) {
        throw new ValidationError(
          "Requested slot time is outside the doctor's schedule",
        );
      }

      if (slot.status === "booked") {
        throw new ConflictError("This slot is already booked");
      }

      if (slot.status === "past") {
        throw new ValidationError("Cannot book a past time slot");
      }

      // 5. Create Appointment with atomic constraints (handled by unique index)
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctor._id,
        department: data.department,
        date: targetDate,
        slotTime: data.slotTime,
        purpose: data.purpose || "",
        notes: data.notes || "",
        bookedBy: bookedByUserId,
      });

      await appointment.save({ session });

      await session.commitTransaction();
      session.endSession();

      const populated = await Appointment.findById(appointment._id)
        .populate("patient")
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email" },
        })
        .populate("bookedBy", "name email role");

      // Emit Socket event for real-time update
      emitAppointmentEvent("appointment:created", populated);

      return populated;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Handle MongoDB Unique Index duplication error (Double Booking check)
      if (error.code === 11000) {
        throw new ConflictError(
          "This slot has just been booked by another user. Please choose a different slot.",
        );
      }
      throw error;
    }
  }

  static async getAll({
    page = 1,
    limit = 12,
    sort = "createdAt",
    doctorId = "",
    patientId = "",
    department = "",
    status = "",
    dateFrom = "",
    dateTo = "",
    search = "",
  }) {
    try {
      const query = {};

      // Direct filters
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
      if (department) query.department = { $regex: department, $options: "i" };
      if (status) query.status = status;

      // Date range filter
      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          query.date.$gte = from;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          query.date.$lte = to;
        }
      }

      // Search Optimization
      if (search) {
        // Query matching patient records
        const matchedPatients = await Patient.find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { patientId: { $regex: search, $options: "i" } },
          ],
        }).select("_id");

        // Query matching doctor profiles (user name match)
        const matchedDoctors = await Doctor.find()
          .populate({
            path: "user",
            match: { name: { $regex: search, $options: "i" } },
          })
          .select("_id");

        const doctorIds = matchedDoctors
          .filter((d) => d.user) // Filter out doctors whose users didn't match
          .map((d) => d._id);

        const patientIds = matchedPatients.map((p) => p._id);

        query.$or = [
          { patient: { $in: patientIds } },
          { doctor: { $in: doctorIds } },
        ];
      }

      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate("patient")
          .populate({
            path: "doctor",
            populate: { path: "user", select: "name email" },
          })
          .populate("bookedBy", "name email role")
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query),
      ]);

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      };

      return { appointments, pagination };
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const appointment = await Appointment.findById(id)
        .populate("patient")
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email" },
        })
        .populate("bookedBy", "name email role");

      if (!appointment) {
        throw new NotFoundError("Appointment not found");
      }
      return appointment;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new NotFoundError("Appointment not found");
      }

      // Validate status transitions if a status update is requested
      if (data.status && data.status !== appointment.status) {
        const allowedTransitions = {
          scheduled: ["arrived", "cancelled"],
          arrived: ["completed", "cancelled"],
          completed: [],
          cancelled: [],
        };

        const currentAllowed = allowedTransitions[appointment.status] || [];
        if (!currentAllowed.includes(data.status)) {
          throw new ValidationError(
            `Status transition not allowed: cannot transition from ${appointment.status} to ${data.status}`,
          );
        }
      }

      const updated = await Appointment.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
        .populate("patient")
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email" },
        })
        .populate("bookedBy", "name email role");

      // Emit Socket event for real-time update
      emitAppointmentEvent("appointment:updated", updated);

      return updated;
    } catch (error) {
      throw error;
    }
  }

  static async cancel(id, reason) {
    return this.update(id, {
      status: "cancelled",
      cancelReason: reason || "Cancelled by user",
    });
  }

  static async markArrived(id) {
    return this.update(id, { status: "arrived" });
  }
}

module.exports = AppointmentService;
