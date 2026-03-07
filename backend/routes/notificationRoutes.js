const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendNotice } = require("../controllers/notificationController");

// Admin Only
router.post("/send", protect, authorize("admin"), sendNotice);

module.exports = router;
