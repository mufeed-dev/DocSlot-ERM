export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  // 10 to 15 digits
  const re = /^[0-9]{10,15}$/;
  return re.test(phone.replace(/[\s-()]/g, ""));
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validatePastDate = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr);
  return selectedDate < today;
};
