const Attendance = require("../models/Attendance");


const getAttendanceReport = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("student", "name email")
      .populate("markedBy", "name");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAttendanceReport };
