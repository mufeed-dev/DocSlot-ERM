const BaseController = require("./BaseController");
const UserService = require("../services/UserService");
const { userCreateValidation } = require("../utils/validation");

class UserController extends BaseController {
  static createUser = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(
      req.body,
      userCreateValidation,
    );

    const user = await UserService.createUser(validatedData);

    BaseController.logAction("USER_CREATED", {
      user: req.user,
      entity: "User",
      entityId: user._id,
      ipAddress: req.ip,
      role: validatedData.role,
      email: validatedData.email,
      requestId: res.locals.requestId || null,
    });

    BaseController.sendSuccessResponse(
      res,
      `${validatedData.role.toUpperCase()} created successfully`,
      user,
      201,
    );
  });

  static getUsers = BaseController.asyncHandler(async (req, res) => {
    const { role } = req.query;

    const users = await UserService.getUsers(role);

    BaseController.sendSuccessResponse(
      res,
      "Users retrieved successfully",
      users,
    );
  });
}

module.exports = UserController;
