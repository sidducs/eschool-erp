const express = require("express");
const router = express.Router();
const { generateRemark, generateTimetable, generateNotice } = require("../controllers/aiController");
const { getWeakStudents } = require("../controllers/aiControllerHelper");

const { protect, authorize } = require("../middleware/authMiddleware");

// Define the POST routes
router.post("/generate-remark", generateRemark);
router.post("/generate-timetable", generateTimetable);
router.post("/generate-notice", generateNotice);

router.get("/weak-students", protect, authorize("admin", "teacher"), getWeakStudents);

module.exports = router;