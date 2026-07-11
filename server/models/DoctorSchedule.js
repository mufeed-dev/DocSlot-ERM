const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: [true, "Session start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "Session end time is required"],
      trim: true,
    },
  },
  { _id: false },
);

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Associated doctor is required"],
    },
    workingDays: {
      type: [Number], // 0 for Sunday, 1 for Monday, ...
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one working day must be specified",
      },
    },
    slotDuration: {
      type: Number, // duration in minutes
      required: [true, "Slot duration (minutes) is required"],
      min: [5, "Slot duration cannot be less than 5 minutes"],
      max: [120, "Slot duration cannot exceed 120 minutes"],
      default: 15,
    },
    sessions: {
      type: [sessionSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one session must be specified",
      },
    },
    breaks: {
      type: [sessionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

doctorScheduleSchema.index({ doctor: 1 }, { unique: true });

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
