const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Fee controller
const {
  createFeeStructure,
  getFeeStructures,
  getFeeStructureByClass,
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

// ADMIN ROUTES
router.post("/", protect, isAdmin, createFeeStructure);
router.get("/", protect, isAdmin, getFeeStructures);
router.get("/structure/:classId", protect, isAdmin, getFeeStructureByClass);

router.post("/assign", protect, isAdmin, assignFeeToStudent);

router.get("/student-fees", protect, isAdmin, getAllStudentFees);

router.put("/pay", protect, isAdmin, updatePayment);

// STUDENT ROUTES
router.get("/my-fee", protect, getMyFee);

// RECEIPTS

// STUDENT → download own receipt (ORDER MATTERS)
router.get(
  "/receipt/my",
  protect,
  generateMyFeeReceipt
);

// ADMIN → download any student's receipt by Fee ID
router.get(
  "/receipt/:id",
  protect,
  isAdmin,
  generateFeeReceipt
);

module.exports = router;
