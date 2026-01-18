const Exam = require("../models/Exam");
// GET ALL EXAMS (ADMIN / TEACHER)
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("classId");
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE EXAM (ADMIN)
const createExam = async (req, res) => {
  try {
    const { name, classId, subject, totalMarks, examDate } = req.body;

    const exam = await Exam.create({
      name,
      classId,
      subject,
      totalMarks,
      examDate,
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExam , getExams };
