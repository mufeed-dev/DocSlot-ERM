const DoctorSchedule = require("../models/DoctorSchedule");
const mongoose = require("mongoose");
const { NotFoundError } = require("../utils/error");

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

class SlotService {
  static async generateSlots(doctorId, dateString) {
    try {
      const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
      if (!schedule) {
        throw new NotFoundError("Schedule not configured for this doctor");
      }

      const targetDate = new Date(dateString);
      const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ...

      // Check target date is working day
      if (!schedule.workingDays.includes(dayOfWeek)) {
        return []; // Return empty if doctor doesn't work this day
      }

      const slots = [];
      const breaks = schedule.breaks.map((b) => ({
        start: toMinutes(b.startTime),
        end: toMinutes(b.endTime),
      }));

      // Generate slots per session
      for (const session of schedule.sessions) {
        let currentStart = toMinutes(session.startTime);
        const sessionEnd = toMinutes(session.endTime);
        const duration = schedule.slotDuration;

        while (currentStart + duration <= sessionEnd) {
          const currentEnd = currentStart + duration;

          // Check if slot overlaps with any break
          const overlapsBreak = breaks.some(
            (b) => currentStart < b.end && b.start < currentEnd,
          );

          if (!overlapsBreak) {
            slots.push({
              time: toHHMM(currentStart),
              status: "available",
            });
          }

          currentStart += duration;
        }
      }

      // Query existing appointments for this doctor and date
      // Dynamic require to prevent circular dependencies
      const Appointment = mongoose.model("Appointment");

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        doctor: doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["scheduled", "arrived", "completed"] },
      });

      const bookedTimes = new Set(appointments.map((app) => app.slotTime));

      // Filter past time slots if date is today
      const today = new Date();
      const isToday =
        targetDate.getDate() === today.getDate() &&
        targetDate.getMonth() === today.getMonth() &&
        targetDate.getFullYear() === today.getFullYear();

      const currentMinutes = today.getHours() * 60 + today.getMinutes();

      // Final slot status assignment
      return slots.map((slot) => {
        const slotMinutes = toMinutes(slot.time);

        if (bookedTimes.has(slot.time)) {
          return { ...slot, status: "booked" };
        }

        if (isToday && slotMinutes <= currentMinutes) {
          return { ...slot, status: "past" };
        }

        return slot;
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SlotService;
