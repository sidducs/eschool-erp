const express = require("express");
const router = express.Router();
const { protect, teacher } = require("../middleware/authMiddleware");
const fileUpload = require("../middleware/fileUpload"); // Revert to Cloudinary

const {
    createAssignment,
    getClassAssignments,
    getTeacherAssignments,
    deleteAssignment
} = require("../controllers/assignmentController");

// Teacher Routes
router.post("/create", protect, teacher, fileUpload.single("attachment"), createAssignment);
router.get("/teacher/my-assignments", protect, teacher, getTeacherAssignments);
router.delete("/:id", protect, teacher, deleteAssignment);

// Student/General Routes
router.get("/class/:classId", protect, getClassAssignments);

module.exports = router;
