const FeeStructure = require("../models/FeeStructure");
const StudentFee = require("../models/StudentFee");
const User = require("../models/User");

// Create or update fee structure
const createFeeStructure = async (req, res) => {
  try {
    const { classId, totalFee, description, breakdown } = req.body;

    if (!classId || !totalFee) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const fee = await FeeStructure.findOneAndUpdate(
      { classId },
      { totalFee, description, breakdown },
      { upsert: true, new: true }
    );

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all fee structures
const getFeeStructures = async (req, res) => {
  try {
    const fees = await FeeStructure.find().populate("classId");
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign fee to student
const assignFeeToStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const feeStructure = await FeeStructure.findOne({
      classId: student.classId,
    });

    if (!feeStructure) {
      return res.status(404).json({
        message: "Fee structure not found for this class",
      });
    }

    const studentFee = await StudentFee.findOneAndUpdate(
      { studentId },
      {
        studentId,
        classId: student.classId,
        totalFee: feeStructure.totalFee,
        paidAmount: 0,
        status: "PENDING",
      },
      { upsert: true, new: true }
    );

    res.json(studentFee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update payment status
const updatePayment = async (req, res) => {
  try {
    const { studentId, paidAmount } = req.body;

    const fee = await StudentFee.findOne({ studentId });
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    fee.paidAmount = Number(paidAmount);
    fee.status =
      fee.paidAmount >= fee.totalFee ? "PAID" : "PENDING";

    await fee.save();
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all student fees
const getAllStudentFees = async (req, res) => {
  try {
    const fees = await StudentFee.find()
      .populate("studentId", "name email admissionId")
      .populate("classId", "name section");

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my fee (Student)
const getMyFee = async (req, res) => {
  try {
    const fee = await StudentFee.findOne({
      studentId: req.user._id,
    })
      .populate("studentId", "name email admissionId")
      .populate("classId", "name section");

    if (!fee) {
      return res.status(404).json({ message: "Fee not assigned" });
    }

    // Fetch breakdown structure for this class
    const structure = await FeeStructure.findOne({ classId: fee.classId._id });

    res.json({
      ...fee.toObject(),
      breakdown: structure ? structure.breakdown : []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createFeeStructure,
  getFeeStructures,
  assignFeeToStudent,
  updatePayment,
  getAllStudentFees,
  getMyFee,
};
