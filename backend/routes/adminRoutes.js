const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  createUser,
  deleteUser,
  updateUser
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

module.exports = router;
