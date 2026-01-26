const Timetable = require("../models/Timetable");
const mongoose = require("mongoose");

// ✅ Admin: Create timetable entry
exports.createTimetable = async (req, res) => {
  try {
    const { classId, day, timeSlot, subject, teacher } = req.body;

    // Validation: Ensure teacher is a valid ObjectId
    if (!teacher || !mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({ message: "Select a valid teacher." });
    }

    const exists = await Timetable.findOne({ classId, day, timeSlot });
    if (exists) {
      return res.status(400).json({ message: "This time slot is already taken." });
    }

    const entry = await Timetable.create({
      classId,
      day,
      timeSlot,
      subject,
      teacher,
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Student: View by Class
exports.getTimetableByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const data = await Timetable.find({ classId })
      .populate("teacher", "name") // Turns ID into { _id, name }
      .sort({ day: 1, timeSlot: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Teacher: View own schedule
exports.getTimetableByTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const data = await Timetable.find({ teacher: teacherId })
      .populate("classId", "name section")
      .sort({ day: 1, timeSlot: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};