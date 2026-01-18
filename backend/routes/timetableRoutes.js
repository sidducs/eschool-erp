const express = require("express");
const router = express.Router();

const {
  createTimetable,
  getTimetableByClass,
  getTimetableByTeacher,
} = require("../controllers/timetableController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Admin creates timetable
router.post("/", protect, isAdmin, createTimetable);

// Student view by class
router.get("/class/:classId", protect, getTimetableByClass);

// Teacher view (own schedule)
router.get("/teacher", protect, getTimetableByTeacher);

module.exports = router;
