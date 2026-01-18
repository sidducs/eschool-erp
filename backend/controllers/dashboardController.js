const User = require("../models/User");
const Class = require("../models/Class");
const StudentFee = require("../models/StudentFee");
const Attendance = require("../models/Attendance");

const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalClasses = await Class.countDocuments();

    const fees = await StudentFee.find();
    let totalCollected = 0;
    let totalPending = 0;

    fees.forEach((f) => {
      totalCollected += f.paidAmount;
      totalPending += f.totalFee - f.paidAmount;
    });

    const totalRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({
      status: "Present",
    });

    const attendancePercentage =
      totalRecords === 0
        ? 0
        : Math.round((presentRecords / totalRecords) * 100);

    res.json({
      users: {
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalAdmins,
      },
      classes: totalClasses,
      fees: {
        collected: totalCollected,
        pending: totalPending,
      },
      attendancePercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
