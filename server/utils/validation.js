const Joi = require("joi");

const commonPatterns = {
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
    }),
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
};

const customMessages = {
  "string.min": "{#label} must be at least {#limit} characters long",
  "string.max": "{#label} cannot exceed {#limit} characters",
  "string.email": "Please provide a valid email address",
  "any.required": "{#label} is required",
  "string.pattern.base": "{#label} format is invalid",
};

const loginValidation = Joi.object({
  email: commonPatterns.email,
  password: Joi.string().required(),
}).messages(customMessages);

const userCreateValidation = Joi.object({
  name: commonPatterns.name,
  email: commonPatterns.email,
  password: commonPatterns.password,
  role: Joi.string().valid("doctor", "receptionist").required(),
}).messages(customMessages);

const doctorValidation = Joi.object({
  name: commonPatterns.name,
  email: commonPatterns.email,
  password: commonPatterns.password,
  department: Joi.string().min(2).max(100).trim().required(),
  specialization: Joi.string().min(2).max(100).trim().required(),
  qualification: Joi.string().min(2).max(100).trim().required(),
  phone: Joi.string().min(10).max(15).trim().required(),
}).messages(customMessages);

const sessionSchema = Joi.object({
  startTime: Joi.string()
    .pattern(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Start time must be in HH:MM format",
    }),
  endTime: Joi.string()
    .pattern(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "End time must be in HH:MM format",
    }),
});

const scheduleValidation = Joi.object({
  doctor: commonPatterns.objectId.required(),
  workingDays: Joi.array()
    .items(Joi.number().integer().min(0).max(6))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one working day is required",
    }),
  slotDuration: Joi.number().integer().min(5).max(120).required(),
  sessions: Joi.array().items(sessionSchema).min(1).required().messages({
    "array.min": "At least one session is required",
  }),
  breaks: Joi.array().items(sessionSchema).optional(),
}).messages(customMessages);

const patientValidation = Joi.object({
  name: commonPatterns.name,
  email: Joi.string().email().lowercase().trim().allow("").optional(),
  phone: Joi.string().min(10).max(15).trim().required(),
  dateOfBirth: Joi.date().less("now").required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  address: Joi.string().max(500).trim().allow("").optional(),
}).messages(customMessages);

const appointmentValidation = Joi.object({
  patient: Joi.alternatives()
    .try(
      commonPatterns.objectId, // existing patient ID
      patientValidation, // new patient registration object
    )
    .required(),
  doctor: commonPatterns.objectId.required(),
  department: Joi.string().min(2).max(100).trim().required(),
  date: Joi.date().iso().required(),
  slotTime: Joi.string()
    .pattern(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Slot time must be in HH:MM format",
    }),
  purpose: Joi.string().max(500).trim().allow("").optional(),
  notes: Joi.string().max(2000).trim().allow("").optional(),
}).messages(customMessages);

const appointmentUpdateValidation = Joi.object({
  purpose: Joi.string().max(500).trim().optional(),
  notes: Joi.string().max(2000).trim().optional(),
  status: Joi.string()
    .valid("scheduled", "arrived", "completed", "cancelled")
    .optional(),
  cancelReason: Joi.string().max(500).trim().optional(),
}).messages(customMessages);

module.exports = {
  loginValidation,
  userCreateValidation,
  doctorValidation,
  scheduleValidation,
  patientValidation,
  appointmentValidation,
  appointmentUpdateValidation,
};
