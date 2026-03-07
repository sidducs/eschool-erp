const express = require("express");
const router = express.Router();
const { protect, admin, teacher, authorize } = require("../middleware/authMiddleware");
const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
} = require("../controllers/leaveController");

// Student/Teacher can apply and view their own
router.post("/apply", protect, applyLeave);
router.get("/my-leaves", protect, getMyLeaves);

// Admin and Teacher can view all (Teachers might need to approve student leaves)
// Allowing 'admin' and 'teacher' to view all/approve.
router.get("/all", protect, authorize("admin", "teacher"), getAllLeaves);
router.put("/:id/status", protect, authorize("admin", "teacher"), updateLeaveStatus);

module.exports = router;
