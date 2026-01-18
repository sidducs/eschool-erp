const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin, isTeacher } = require("../middleware/adminMiddleware");
const { createExam, getExams } = require("../controllers/examController");

const router = express.Router();

// Admin creates exam
router.post("/", protect, isAdmin, createExam);

// Admin / Teacher get exams
router.get("/", protect, getExams);

module.exports = router;
