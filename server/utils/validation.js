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

module.exports = {
  loginValidation,
};
