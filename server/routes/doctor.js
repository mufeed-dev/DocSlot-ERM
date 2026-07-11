const express = require("express");
const router = express.Router();
const DoctorController = require("../controllers/doctorController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(authenticateUser);

router.post("/", authorizeRoles("superadmin"), DoctorController.create);
router.get("/", DoctorController.getAll);
router.get("/:id", DoctorController.getById);

module.exports = router;
