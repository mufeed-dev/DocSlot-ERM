const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", authenticateUser, AuthController.logout);

module.exports = router;
