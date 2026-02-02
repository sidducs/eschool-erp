const express = require("express");
const router = express.Router();
const { generateRemark, generateTimetable, generateNotice } = require("../controllers/aiController");

// Define the POST routes
router.post("/generate-remark", generateRemark);
router.post("/generate-timetable", generateTimetable);
router.post("/generate-notice", generateNotice);

module.exports = router;