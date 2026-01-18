const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Fee controller
const {
  createFeeStructure,
  getFeeStructures,
  assignFeeToStudent,
  updatePayment,
  getAllStudentFees,
  getMyFee,
} = require("../controllers/feeController");

// Receipt controller (IMPORTANT)
const {
  generateFeeReceipt,
  generateMyFeeReceipt,
} = require("../controllers/receiptController");

// ================= ADMIN =================
router.post("/", protect, isAdmin, createFeeStructure);
router.get("/", protect, isAdmin, getFeeStructures);

router.post("/assign", protect, isAdmin, assignFeeToStudent);

router.get("/student-fees", protect, isAdmin, getAllStudentFees);

router.put("/pay", protect, isAdmin, updatePayment);

// ================= STUDENT =================
router.get("/my-fee", protect, getMyFee);

// ===== RECEIPTS =====

// STUDENT → download own receipt (ORDER MATTERS)
router.get(
  "/receipt/my",
  protect,
  generateMyFeeReceipt
);

// ADMIN → download any student's receipt
router.get(
  "/receipt/:studentId",
  protect,
  isAdmin,
  generateFeeReceipt
);

module.exports = router;
