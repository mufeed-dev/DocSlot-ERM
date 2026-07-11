const express = require("express");
const router = express.Router();
const PatientController = require("../controllers/patientController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(authenticateUser);

router.post(
  "/",
  authorizeRoles("superadmin", "receptionist"),
  PatientController.create,
);
router.get("/search", PatientController.search);

module.exports = router;
