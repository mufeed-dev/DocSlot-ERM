const express = require("express");
const router = express.Router();
const ScheduleController = require("../controllers/scheduleController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(authenticateUser);

router.post(
  "/",
  authorizeRoles("superadmin"),
  ScheduleController.createOrUpdate,
);
router.get("/doctor/:doctorId", ScheduleController.getByDoctor);

module.exports = router;
