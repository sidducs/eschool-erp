const express = require("express");
const router = express.Router();
const {
  createTimetable,
  getTimetableByClass,
  getTimetableByTeacher,
  getTimetableForTeacher,
  deleteTimetable,
  updateTimetable
} = require("../controllers/timetableController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Admin creates timetable
router.post("/", protect, isAdmin, createTimetable);

// Student view by class
router.get("/class/:classId", protect, getTimetableByClass);

// Teacher view (own schedule)
router.get("/teacher", protect, getTimetableByTeacher);

// Admin view specific teacher
router.get("/teacher/:teacherId", protect, isAdmin, getTimetableForTeacher);

// Update/Delete
router.delete("/:id", protect, isAdmin, deleteTimetable);
router.put("/:id", protect, isAdmin, updateTimetable);

module.exports = router;