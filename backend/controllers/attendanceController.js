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
    const { studentId, classId, date, status, subject } = req.body;

    // Check student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    // Prevent duplicate attendance (Check subject if provided)
    const query = { student: studentId, classId, date };
    if (subject) query.subject = subject;

    const exists = await Attendance.findOne(query);

    if (exists) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for this date/subject" });
    }

    const attendance = await Attendance.create({
      student: studentId,
      classId,
      date,
      status,
      subject: subject || null,
      markedBy: req.user._id,
    });

    // 📧 Send Email Notification if Absent
    if (status === "Absent") {
      const sendEmail = require("../utils/emailService");
      const parentEmail = student.parentEmail || student.email; // Fallback to student email if parent not found

      if (parentEmail) {
        sendEmail(
          parentEmail,
          "Absence Alert - ESchool ERP",
          `Dear Parent/Student,\n\nThis is to inform you that ${student.name} was marked ABSENT today (${date}).\n\nSubject: ${subject || "Daily Attendance"}\n\nPlease contact the school if this is an error.\n\nRegards,\nESchool Administration`
        );
      }
    }

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

// Parent views child's attendance
const getAttendanceByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({
      student: studentId,
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
  getAttendanceByStudentId,
};
