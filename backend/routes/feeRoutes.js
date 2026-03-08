const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

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

// ADMIN & ACCOUNTANT ROUTES
router.post("/", protect, authorize("admin"), createFeeStructure);
router.get("/", protect, authorize("admin", "accountant"), getFeeStructures);
router.get("/structure/:classId", protect, authorize("admin", "accountant"), getFeeStructureByClass);

router.post("/assign", protect, authorize("admin"), assignFeeToStudent);

router.get("/student-fees", protect, authorize("admin", "accountant"), getAllStudentFees);

router.put("/pay", protect, authorize("admin", "accountant"), updatePayment);

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
  authorize("admin"),
  generateFeeReceipt
);

module.exports = router;
