const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    submitAssignment,
    getSubmissionsForAssignment,
    gradeSubmission,
    getMySubmissions
} = require("../controllers/submissionController");

router.post("/submit", protect, authorize("student"), submitAssignment);
router.get("/my", protect, authorize("student"), getMySubmissions);
router.get("/assignment/:id", protect, authorize("teacher", "admin"), getSubmissionsForAssignment);
router.put("/:id/grade", protect, authorize("teacher", "admin"), gradeSubmission);

module.exports = router;
