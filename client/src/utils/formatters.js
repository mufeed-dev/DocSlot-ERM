export const formatAuditAction = (action) => {
  const mapping = {
    USER_LOGGED_IN: "Login",
    USER_LOGGED_OUT: "Logout",
    TOKEN_REFRESHED: "Token Refreshed",
    USER_CREATED: "User Created",
    DOCTOR_CREATED: "Doctor Created",
    PATIENT_CREATED: "Patient Created",
    SCHEDULE_CONFIGURED: "Schedule Configured",
    APPOINTMENT_CREATED: "Appointment Created",
    APPOINTMENT_UPDATED: "Appointment Updated",
    APPOINTMENT_CANCELLED: "Appointment Cancelled",
    PATIENT_MARKED_ARRIVED: "Patient Marked Arrived",
  };
  return mapping[action] || action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
