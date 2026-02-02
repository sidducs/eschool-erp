const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, admin, updateSettings);

module.exports = router;
