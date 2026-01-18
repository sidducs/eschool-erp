const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  markAttendance,
  getMyAttendance,
} = require("../controllers/attendanceController");
const { getStudentsForTeacher } = require("../controllers/attendanceController");

const router = express.Router();
// Teacher → get students list
router.get("/students", protect, getStudentsForTeacher);

// Teacher marks attendance
router.post("/", protect, markAttendance);

// Student views attendance
router.get("/me", protect, getMyAttendance);

module.exports = router;
