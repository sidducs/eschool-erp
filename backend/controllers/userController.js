const User = require("../models/User");

// GET STUDENTS BY CLASS (TEACHER)
const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.query;

    // Strong validation
    if (!classId || classId === "undefined" || classId === "[object Object]") {
      return res.status(400).json({ message: "Invalid classId" });
    }

    const students = await User.find({
      role: "student",
      classId: classId,
    }).select("-password");

    res.json(students);
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getStudentsByClass,
};
