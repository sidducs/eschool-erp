const Timetable = require("../models/Timetable");

// Create timetable entry
exports.createTimetable = async (req, res) => {
  try {
    const { classId, day, timeSlot, subject, teacher } = req.body;

    const exists = await Timetable.findOne({ classId, day, timeSlot });
    if (exists) {
      return res.status(400).json({
        message: "This time slot is already assigned for this class and day",
      });
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

// Student view
exports.getTimetableByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const data = await Timetable.find({ classId })
      .populate("teacher", "name")
      .sort({ day: 1, timeSlot: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher view
exports.getTimetableByTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const data = await Timetable.find({ teacher: teacherId })
      // --- FIX IS HERE ---
      // We added "section" so it fetches both Name and Section
      .populate("classId", "name section") 
      .sort({ day: 1, timeSlot: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};