const Result = require("../models/Result");
const Exam = require("../models/Exam");
const User = require("../models/User");

// CREATE / UPDATE RESULT (TEACHER)
const enterMarks = async (req, res) => {
  try {
    const { examId, studentId, marksObtained } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const status =
      marksObtained >= exam.totalMarks * 0.35 ? "Pass" : "Fail";

    const result = await Result.findOneAndUpdate(
      { examId, studentId },
      { marksObtained, status },
      { upsert: true, new: true }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET RESULTS FOR LOGGED-IN STUDENT
const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({
      studentId: req.user._id,
    })
      .populate({
        path: "examId",
        populate: { path: "classId" },
      });

    const formatted = results.map((r) => {
      const percentage = (r.marksObtained / r.examId.totalMarks) * 100;

      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B";
      else if (percentage >= 60) grade = "C";
      else if (percentage >= 50) grade = "D";

      return {
        examName: r.examId.name,
        subject: r.examId.subject,
        totalMarks: r.examId.totalMarks,
        marksObtained: r.marksObtained,
        percentage: percentage.toFixed(2),
        grade: grade,
        status: r.status,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enterMarks, getStudentResults };
