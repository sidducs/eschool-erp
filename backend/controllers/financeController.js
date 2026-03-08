const Expense = require("../models/Expense");
const Payroll = require("../models/Payroll");
const StudentFee = require("../models/StudentFee");

const getFinanceStats = async (req, res) => {
    try {
        const totalFees = await StudentFee.aggregate([
            { $group: { _id: null, total: { $sum: "$paidAmount" } } }
        ]);

        const totalExpenses = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const pendingFees = await StudentFee.aggregate([
            { $project: { pending: { $subtract: ["$totalFee", "$paidAmount"] } } },
            { $group: { _id: null, total: { $sum: "$pending" } } }
        ]);

        res.json({
            collectedFees: totalFees[0]?.total || 0,
            totalExpenses: totalExpenses[0]?.total || 0,
            pendingFees: pendingFees[0]?.total || 0,
            netBalance: (totalFees[0]?.total || 0) - (totalExpenses[0]?.total || 0)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addExpense = async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            recordedBy: req.user._id
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addPayroll = async (req, res) => {
    try {
        const payroll = await Payroll.create(req.body);
        res.status(201).json(payroll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Payroll Records
// @route   GET /api/finance/payroll
// @access  Accountant
const getPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find().populate("staffId", "name role email").sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFinancialReports = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Monthly Fee Collection
        const monthlyFees = await StudentFee.aggregate([
            { $match: { updatedAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$paidAmount" } } }
        ]);

        // 2. Expense Analysis (By Category)
        const expenseAnalysis = await Expense.aggregate([
            { $group: { _id: "$category", total: { $sum: "$amount" } } }
        ]);

        // 3. Overall Balance Sheet
        const totalFees = await StudentFee.aggregate([{ $group: { _id: null, total: { $sum: "$paidAmount" } } }]);
        const totalExpenses = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
        const totalPayroll = await Payroll.aggregate([{ $group: { _id: null, total: { $sum: "$salaryAmount" } } }]);

        const assets = totalFees[0]?.total || 0;
        const liabilities = (totalExpenses[0]?.total || 0) + (totalPayroll[0]?.total || 0);
        const netLiquidity = assets - liabilities;

        res.json({
            monthlyCollection: monthlyFees[0]?.total || 0,
            expenseAnalysis: expenseAnalysis.map(e => ({ category: e._id || "Uncategorized", amount: e.total })),
            balanceSheet: {
                totalAssets: assets,
                totalLiabilities: liabilities,
                netLiquidity: netLiquidity
            },
            taxCompliance: {
                estimatedTax: Math.max(0, netLiquidity * 0.05), // 5% flat estimate
                status: "Pending Review"
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFinanceStats,
    addExpense,
    getExpenses,
    addPayroll,
    getPayroll,
    getFinancialReports
};
