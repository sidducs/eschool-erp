const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

const {
  createClass,
  assignStudentToClass,
  getAllClasses,
  getStudentsByClass,
} = require("../controllers/classController");

const router = express.Router();

// 👨‍💼 ADMIN ONLY
router.post("/", protect, isAdmin, createClass);
router.post("/assign-student", protect, isAdmin, assignStudentToClass);
router.post("/bulk-assign", protect, isAdmin, require("../controllers/classController").assignStudentsToClass);

// 👩‍🏫 ADMIN + TEACHER (read-only)
router.get("/", protect, getAllClasses);

// 👩‍🏫 TEACHER
router.get("/:classId/students", protect, getStudentsByClass);

module.exports = router;
