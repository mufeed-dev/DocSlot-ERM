const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(authenticateUser);
router.use(authorizeRoles("superadmin")); // Only Super Admin can manage other user accounts

router.post("/", UserController.createUser);
router.get("/", UserController.getUsers);

module.exports = router;
