const Attendance = require("../models/Attendance");
const User = require("../models/User");
const mongoose = require("mongoose");
const { sendEmail } = require("../services/notificationService");
const { absenceAlertTemplate } = require("../services/emailTemplates");
const { verifyChildOwnership } = require("./parentController");

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

    // 📧 Send Absence Alert Email if student is marked Absent
    if (status === "Absent") {
      try {
        (async () => {
          const settings = await require("../models/SchoolSettings").findOne();
          const schoolName = settings?.schoolName || "ESchool ERP";
          
          // Find linked parent
          const parent = await User.findOne({ role: "parent", children: studentId });
          const alertEmail = parent?.email || student.email;

          await sendEmail(
            alertEmail,
            `Absence Alert - ${student.name}`,
            `${student.name} was marked absent on ${date}`,
            absenceAlertTemplate(student.name, date, subject || "Daily Attendance", schoolName)
          );
        })();
      } catch (e) {
        console.error("Absence alert email failed:", e.message);
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

    // 🔐 TC-PAR-03: Validate ID format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    // 🔐 TC-PAR-03: Ownership check — parents can only view their own children
    if (req.user.role === "parent") {
      const isOwner = await verifyChildOwnership(req.user._id, studentId);
      if (!isOwner) {
        return res.status(403).json({ message: "Access denied to this student record" });
      }
    }

    const records = await Attendance.find({ student: studentId });
    const total = records.length;
    const present = records.filter(r => r.status === "Present").length;
    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

    res.json({ records, total, present, percentage });
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
