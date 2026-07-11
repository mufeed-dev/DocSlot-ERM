const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointmentController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(authenticateUser);

router.post(
  "/",
  authorizeRoles("superadmin", "receptionist"),
  AppointmentController.create,
);
router.get("/", AppointmentController.getAll);
router.get("/:id", AppointmentController.getById);
router.put("/:id", AppointmentController.update);
router.delete(
  "/:id",
  authorizeRoles("superadmin", "receptionist"),
  AppointmentController.cancel,
);
router.post(
  "/:id/arrive",
  authorizeRoles("superadmin", "receptionist"),
  AppointmentController.markArrived,
);

module.exports = router;
