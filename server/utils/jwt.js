const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { AuthenticationError } = require("./error");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT.ACCESS_SECRET, {
    expiresIn: config.JWT.ACCESS_EXPIRES_IN,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.JWT.REFRESH_SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN,
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT.ACCESS_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError("Access token has expired.");
    }
    throw new AuthenticationError("Invalid access token.");
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT.REFRESH_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError("Refresh token has expired. Login again.");
    }
    throw new AuthenticationError("Invalid refresh token.");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
