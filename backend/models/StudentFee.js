const mongoose = require("mongoose");

const studentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    totalFee: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    breakdown: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true }
    }],

    status: {
      type: String,
      enum: ["PAID", "PENDING"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentFee", studentFeeSchema);
