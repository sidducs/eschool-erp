const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getFinanceStats,
    addExpense,
    getExpenses,
    addPayroll,
    getPayroll
} = require("../controllers/financeController");

router.get("/stats", protect, authorize("accountant", "admin"), getFinanceStats);

router.post("/expenses", protect, authorize("accountant", "admin"), addExpense);
router.get("/expenses", protect, authorize("accountant", "admin"), getExpenses);

router.post("/payroll", protect, authorize("accountant", "admin"), addPayroll);
router.get("/payroll", protect, authorize("accountant", "admin"), getPayroll);

module.exports = router;
