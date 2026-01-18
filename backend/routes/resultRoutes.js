
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isTeacher } = require("../middleware/teacherMiddleware");
const {generateFeeReceipt,} = require("../controllers/receiptController");

const {
  enterMarks,
  getStudentResults,
} = require("../controllers/resultController");

// TEACHER → ENTER MARKS
router.post("/", protect, isTeacher, enterMarks);

// STUDENT → VIEW RESULTS
router.get("/student", protect, getStudentResults);
router.get(
  "/receipt/:studentId",
  protect,
  generateFeeReceipt
);
module.exports = router;
