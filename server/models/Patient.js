const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Patient name must be at least 2 characters"],
      maxlength: [100, "Patient name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

patientSchema.index({ phone: 1 });
patientSchema.index({ name: "text" });

// Auto-generate Patient ID pre-save
patientSchema.pre("save", async function () {
  if (this.patientId) return;

  const Patient = mongoose.model("Patient");
  const lastPatient = await Patient.findOne(
    {},
    {},
    { sort: { createdAt: -1 } },
  );

  let nextIdNum = 1;
  if (lastPatient && lastPatient.patientId) {
    const lastIdNum = parseInt(lastPatient.patientId.replace("PAT-", ""), 10);
    if (!isNaN(lastIdNum)) {
      nextIdNum = lastIdNum + 1;
    }
  }

  this.patientId = `PAT-${nextIdNum.toString().padStart(4, "0")}`;
});

module.exports = mongoose.model("Patient", patientSchema);
