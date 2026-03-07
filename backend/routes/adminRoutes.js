const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  createUser,
  deleteUser,
  updateUser,
  approveStudent,
  resetPassword
} = require("../controllers/adminController");
const { getAllStudents } = require("../controllers/adminController");
const { getAttendanceReport } = require("../controllers/reportController");

const router = express.Router();
router.get("/students", protect, isAdmin, getAllStudents);
router.get("/users", protect, isAdmin, getAllUsers);
router.post("/users", protect, isAdmin, createUser);
router.delete("/users/:id", protect, isAdmin, deleteUser);
router.get("/attendance", protect, isAdmin, getAttendanceReport);
router.put("/users/:id", protect, isAdmin, updateUser);
router.put("/approve/:id", protect, isAdmin, approveStudent); // Approval Route
router.put("/reset-password/:id", protect, isAdmin, resetPassword);

// Security Routes
const { getAuditLogs, downloadBackup } = require("../controllers/securityController");
router.get("/audit-logs", protect, isAdmin, getAuditLogs);
router.get("/backup", protect, isAdmin, downloadBackup);

module.exports = router;
