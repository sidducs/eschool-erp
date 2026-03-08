const express = require("express");
const router = express.Router();
const { generateRemark, generateTimetable, generateNotice, generateQuizQuestions } = require("../controllers/aiController");
const { getWeakStudents } = require("../controllers/aiControllerHelper");

const { protect, authorize } = require("../middleware/authMiddleware");

// Define the POST routes
router.post("/generate-remark", generateRemark);
router.post("/generate-timetable", generateTimetable);
router.post("/generate-notice", generateNotice);
router.post("/generate-quiz", protect, authorize("admin", "teacher"), generateQuizQuestions);

router.get("/weak-students", protect, authorize("admin", "teacher"), getWeakStudents);

module.exports = router;