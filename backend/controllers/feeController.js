const FeeStructure = require("../models/FeeStructure");
const StudentFee = require("../models/StudentFee");
const User = require("../models/User");
const { sendEmail, sendSMS } = require("../services/notificationService");

/*
-----------------------------------
Create or Update Fee Structure
-----------------------------------
*/
const createFeeStructure = async (req, res) => {
  try {
    const { classId, totalFee, description, breakdown } = req.body;

    if (!classId || !totalFee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fee = await FeeStructure.findOneAndUpdate(
      { classId },
      { totalFee, description, breakdown },
      { upsert: true, new: true }
    );

    res.json(fee);
  } catch (error) {
    console.error("createFeeStructure error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
-----------------------------------
Get All Fee Structures
-----------------------------------
*/
const getFeeStructures = async (req, res) => {
  try {
    const fees = await FeeStructure.find().populate("classId");
    res.json(fees);
  } catch (error) {
    console.error("getFeeStructures error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
-----------------------------------
Get Fee Structure By Class
-----------------------------------
*/
const getFeeStructureByClass = async (req, res) => {
  try {
    const fee = await FeeStructure.findOne({
      classId: req.params.classId,
    }).populate("classId");

    if (!fee) {
      return res.status(404).json({ message: "Structure not found" });
    }

    res.json(fee);
  } catch (error) {
    console.error("getFeeStructureByClass error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
-----------------------------------
Assign Fee To Student
-----------------------------------
*/
const assignFeeToStudent = async (req, res) => {
  try {
    const { studentId, description, dueDate, breakdown, feeStructureId } =
      req.body;

    const student = await User.findById(studentId);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    let feeBreakdown = [];
    let calculatedTotal = 0;

    /*
    SCENARIO 1
    Use existing Fee Structure
    */
    if (feeStructureId) {
      const structure = await FeeStructure.findById(feeStructureId);

      if (!structure) {
        return res
          .status(404)
          .json({ message: "Selected Fee Structure not found" });
      }

      feeBreakdown =
        breakdown && breakdown.length > 0 ? breakdown : structure.breakdown;

      calculatedTotal = feeBreakdown.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );
    }

    /*
    SCENARIO 2
    Custom Breakdown
    */
    else if (breakdown && breakdown.length > 0) {
      feeBreakdown = breakdown;

      calculatedTotal = feeBreakdown.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );
    } else {
      return res
        .status(400)
        .json({ message: "Fee Structure or Custom Breakdown required" });
    }

    /*
    Create or Update Student Fee
    */
    const studentFee = await StudentFee.findOneAndUpdate(
      { studentId },
      {
        studentId,
        classId: student.classId,
        totalFee: calculatedTotal,
        paidAmount: 0,
        status: "PENDING",
        breakdown: feeBreakdown,
      },
      { upsert: true, new: true }
    );

    /*
    --------------------------------
    EMAIL + SMS NOTIFICATIONS
    --------------------------------
    */

    const subject = "New Fee Assigned - ESchool ERP";

    const message = `
Dear ${student.name},

A new fee of Rs. ${calculatedTotal.toLocaleString()} ${description ? `(${description})` : ""
      } has been assigned to you.

Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString() : "Not specified"}

Please login to your portal to view details and pay online.

Regards,
ESchool Administration
`;

    try {
      if (student.email) {
        await sendEmail(student.email, subject, message);
      }

      if (student.parentEmail) {
        await sendEmail(student.parentEmail, subject, message);
      }

      if (student.phoneNumber) {
        await sendSMS(
          student.phoneNumber,
          `Fee of Rs. ${calculatedTotal} assigned.`
        );
      }
    } catch (notifyError) {
      console.error("Notification error:", notifyError.message);
    }

    res.json(studentFee);
  } catch (error) {
    console.error("Assign Fee Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
-----------------------------------
Update Payment
-----------------------------------
*/
const updatePayment = async (req, res) => {
  try {
    const { feeId, studentId, paidAmount, amount } = req.body;

    const parsedAmount = Number(paidAmount) || Number(amount);

    let fee;

    if (feeId) {
      fee = await StudentFee.findById(feeId);
    } else if (studentId) {
      fee = await StudentFee.findOne({ studentId });
    }

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    fee.paidAmount = parsedAmount;

    fee.status =
      fee.paidAmount >= fee.totalFee ? "PAID" : "PENDING";

    await fee.save();

    res.json(fee);
  } catch (error) {
    console.error("updatePayment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
-----------------------------------
Get All Student Fees
-----------------------------------
*/
const getAllStudentFees = async (req, res) => {
  try {
    const fees = await StudentFee.find()
      .populate("studentId", "name email admissionId")
      .populate("classId", "name section");

    res.json(fees);
  } catch (error) {
    console.error("getAllStudentFees error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
-----------------------------------
Get My Fee (Student)
-----------------------------------
*/
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

    const structure = await FeeStructure.findOne({
      classId: fee.classId._id,
    });

    res.json({
      ...fee.toObject(),
      breakdown: structure ? structure.breakdown : [],
    });
  } catch (error) {
    console.error("getMyFee error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFeeStructure,
  getFeeStructures,
  getFeeStructureByClass,
  assignFeeToStudent,
  updatePayment,
  getAllStudentFees,
  getMyFee,
};