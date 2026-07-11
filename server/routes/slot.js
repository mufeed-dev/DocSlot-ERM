const express = require("express");
const router = express.Router();
const SlotController = require("../controllers/slotController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.use(authenticateUser);

router.get("/", SlotController.getSlots);

module.exports = router;
