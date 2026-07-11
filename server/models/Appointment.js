const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    slotTime: {
      type: String,
      required: [true, "Slot time is required"],
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: [500, "Purpose cannot exceed 500 characters"],
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "arrived", "completed", "cancelled"],
      default: "scheduled",
    },
    cancelReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancel reason cannot exceed 500 characters"],
      default: "",
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booked by user is required"],
    },
  },
  {
    timestamps: true,
  },
);

// UNIQUE COMPOUND INDEX FOR DOUBLE BOOKING PREVENTION
// Prevents two user from booking the same doctor, on the same date, at the same slotTime.
appointmentSchema.index(
  { doctor: 1, date: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["scheduled", "arrived", "completed"] },
    },
  },
);

appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
