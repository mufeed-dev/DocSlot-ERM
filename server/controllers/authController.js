const BaseController = require("./BaseController");
const AuthService = require("../services/AuthService");
const { loginValidation } = require("../utils/validation");
const config = require("../config/config");
const { AuthenticationError } = require("../utils/error");

const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
};

const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

class AuthController extends BaseController {
  static login = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      req.body,
      loginValidation,
    );

    const result = await AuthService.login(validatedData);

    res.cookie("accessToken", result.accessToken, accessCookieOptions);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    BaseController.logAction("USER_LOGGED_IN", {
      userId: result.user._id,
      role: result.user.role,
      entity: "User",
      entityId: result.user._id,
      ipAddress: req.ip,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(res, "Login successful", {
      user: result.user,
    });
  });

  static refreshToken = BaseController.asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AuthenticationError("Refresh token cookie is missing");
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, accessCookieOptions);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    BaseController.logAction("TOKEN_REFRESHED", {
      userId: result.user._id,
      role: result.user.role,
      entity: "User",
      entityId: result.user._id,
      ipAddress: req.ip,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(res, "Token refreshed successfully", {
      user: result.user,
    });
  });

  static logout = BaseController.asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user?._id;

    if (refreshToken) {
      await AuthService.logout(userId, refreshToken);
    }

    res.cookie("accessToken", "", { ...cookieOptions, maxAge: 0 });
    res.cookie("refreshToken", "", { ...cookieOptions, maxAge: 0 });

    BaseController.logAction("USER_LOGGED_OUT", {
      userId,
      role: req.user?.role,
      entity: "User",
      entityId: userId,
      ipAddress: req.ip,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(res, "Logout successful", null);
  });
}

module.exports = AuthController;
