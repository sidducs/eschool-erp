const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const { isTeacher } = require("../middleware/teacherMiddleware");
const { getStaff, getStudentsByClass } = require("../controllers/userController");

// PROFILE
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// STAFF & TEACHERS (Used by Payroll / Accountant)
router.get("/staff", protect, getStaff);
router.get("/teachers", protect, getStaff); // Alias for compatibility with old frontend calls

// TEACHER SPECIFIC
router.get(
  "/students-by-class",
  protect,
  isTeacher,
  getStudentsByClass
);

module.exports = router;
