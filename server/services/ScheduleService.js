const DoctorSchedule = require("../models/DoctorSchedule");
const Doctor = require("../models/Doctor");
const { ValidationError, NotFoundError } = require("../utils/error");

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const validateTimeRanges = (ranges, name = "Ranges") => {
  const parsed = [];
  for (const range of ranges) {
    const start = toMinutes(range.startTime);
    const end = toMinutes(range.endTime);

    if (start >= end) {
      throw new ValidationError(
        `Invalid ${name}: start time (${range.startTime}) must be before end time (${range.endTime})`,
      );
    }
    parsed.push({ start, end, original: range });
  }

  // Check internal overlaps
  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      if (parsed[i].start < parsed[j].end && parsed[j].start < parsed[i].end) {
        throw new ValidationError(
          `Overlapping ${name} detected: [${parsed[i].original.startTime} - ${parsed[i].original.endTime}] overlaps with [${parsed[j].original.startTime} - ${parsed[j].original.endTime}]`,
        );
      }
    }
  }
};

class ScheduleService {
  static async createOrUpdate(data) {
    try {
      const doctor = await Doctor.findById(data.doctor);
      if (!doctor) {
        throw new NotFoundError("Doctor profile not found");
      }

      // Validate sessions
      validateTimeRanges(data.sessions, "sessions");

      // Validate breaks
      if (data.breaks && data.breaks.length > 0) {
        validateTimeRanges(data.breaks, "breaks");
      }

      // Find existing schedule or create new
      let schedule = await DoctorSchedule.findOne({ doctor: data.doctor });

      if (schedule) {
        schedule.workingDays = data.workingDays;
        schedule.slotDuration = data.slotDuration;
        schedule.sessions = data.sessions;
        schedule.breaks = data.breaks || [];
      } else {
        schedule = new DoctorSchedule({
          doctor: data.doctor,
          workingDays: data.workingDays,
          slotDuration: data.slotDuration,
          sessions: data.sessions,
          breaks: data.breaks || [],
        });
      }

      await schedule.save();
      return schedule;
    } catch (error) {
      throw error;
    }
  }

  static async getByDoctor(doctorId) {
    try {
      const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
      if (!schedule) {
        throw new NotFoundError("Schedule not configured for this doctor");
      }
      return schedule;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ScheduleService;
