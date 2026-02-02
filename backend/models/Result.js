const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    marksObtained: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pass", "Fail"],
      required: true,
    },

    grade: {
      type: String, // A+, A, B, C, D, F
      default: "",
    },

    remarks: {
      type: String, // e.g. "Excellent work", "Needs improvement"
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
