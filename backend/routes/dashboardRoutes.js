const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  getAdminDashboardStats,
} = require("../controllers/dashboardController");

router.get("/admin", protect, isAdmin, getAdminDashboardStats);

module.exports = router;
