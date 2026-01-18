const Attendance = require("../models/Attendance");
const User = require("../models/User");

// Teacher → get all students
const getStudentsForTeacher = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "_id name email"
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Teacher marks attendance (class-based)
const markAttendance = async (req, res) => {
  try {
    const { studentId, classId, date, status } = req.body;

    // Check student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    // Prevent duplicate attendance
    const exists = await Attendance.findOne({
      student: studentId,
      classId,
      date,
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for this date" });
    }

    const attendance = await Attendance.create({
      student: studentId,
      classId,
      date,
      status,
      markedBy: req.user._id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Student views own attendance
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({
      student: req.user._id,
    });

    const total = records.length;
    const present = records.filter(r => r.status === "Present").length;

    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

    res.json({
      records,
      total,
      present,
      percentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  markAttendance,
  getMyAttendance,
  getStudentsForTeacher,
};
