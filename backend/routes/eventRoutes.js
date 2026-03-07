const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const { getEvents, createEvent, deleteEvent } = require("../controllers/eventController");

const router = express.Router();

router.get("/", protect, getEvents); // All logged-in users can view
router.post("/", protect, isAdmin, createEvent); // Only admin can create
router.delete("/:id", protect, isAdmin, deleteEvent); // Only admin can delete

module.exports = router;
