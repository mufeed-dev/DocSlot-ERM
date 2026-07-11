const { AuthenticationError, AuthorizationError } = require("../utils/error");
const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");
const config = require("../config/config");

const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AuthenticationError(
        "Authentication token is missing. Please log in.",
      );
    }

    const decodedToken = verifyAccessToken(token);

    const user = await User.findById(decodedToken.id);
    if (!user || !user.isActive) {
      throw new AuthenticationError(
        "Session expired or user account is disabled.",
      );
    }

    // Attach user profile to request object
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    res.cookie("accessToken", "", { ...cookieOptions, maxAge: 0 });
    next(error);
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError("Authentication required."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          "Access denied. You do not have permission to perform this action.",
        ),
      );
    }

    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
