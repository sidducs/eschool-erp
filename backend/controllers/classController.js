const Class = require("../models/Class");
const User = require("../models/User");

// Create class (Admin)
const createClass = async (req, res) => {
  try {
    const { name, section, academicYear } = req.body;

    const exists = await Class.findOne({ name, section, academicYear });
    if (exists) {
      return res.status(400).json({ message: "Class already exists" });
    }

    const newClass = await Class.create({
      name,
      section,
      academicYear,
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign student to class (Admin)
const assignStudentToClass = async (req, res) => {
  try {
    const { studentId, classId, rollNumber } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    student.classId = classId;
    student.rollNumber = rollNumber;

    await student.save();

    res.json({ message: "Student assigned to class successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL CLASSES
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1, section: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET STUDENTS BY CLASS
const getStudentsByClass = async (req, res) => {
  try {
    const students = await User.find({
      classId: req.params.classId,
      role: "student",
    }).select("name rollNumber");

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  assignStudentToClass,
  getAllClasses,
  getStudentsByClass,
};
