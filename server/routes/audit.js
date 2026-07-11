const express = require("express");
const router = express.Router();
const AuditController = require("../controllers/auditController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(authenticateUser);
router.use(authorizeRoles("superadmin")); // Only Super Admin can view audit trail logs

router.get("/", AuditController.getLogs);

module.exports = router;
