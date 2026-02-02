const Timetable = require("../models/Timetable");
const mongoose = require("mongoose");

// ✅ Admin: Create timetable entry
exports.createTimetable = async (req, res) => {
  try {
    const { classId, day, timeSlot, subject, teacher } = req.body;

    // Explicit Validation
    if (!classId || !day || !timeSlot || !subject || !teacher) {
      return res.status(400).json({ message: "All fields (Class, Day, Time, Subject, Teacher) are required." });
    }

    // Safety measure: Check if IDs are valid before query
    if (!mongoose.Types.ObjectId.isValid(teacher) || !mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid Teacher or Class ID." });
    }

    // Validation: Ensure teacher is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({ message: "Select a valid teacher." });
    }

    // Helper: Parse "HH:MM - HH:MM" to minutes
    const parseTime = (t) => {
      const [start, end] = t.split("-").map(p => {
        const [h, m] = p.trim().split(":").map(Number);
        return h * 60 + m;
      });
      return { start, end };
    };

    const newTime = parseTime(timeSlot);

    // 1. Check Class Conflict (Overlapping time in same class)
    const classConflicts = await Timetable.find({ classId, day });
    for (const slot of classConflicts) {
      const existing = parseTime(slot.timeSlot);
      if (newTime.start < existing.end && newTime.end > existing.start) {
        return res.status(409).json({ message: `Class is busy with '${slot.subject}' during this time.` });
      }
    }

    // 2. Check Teacher Conflict (Overlapping time for same teacher)
    const teacherConflicts = await Timetable.find({ teacher, day }).populate("classId");
    for (const slot of teacherConflicts) {
      const existing = parseTime(slot.timeSlot);
      if (newTime.start < existing.end && newTime.end > existing.start) {
        const busyClass = slot.classId ? `${slot.classId.name}-${slot.classId.section}` : "a class";
        return res.status(409).json({ message: `Teacher is already in ${busyClass} during this time.` });
      }
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
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
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

// ✅ Admin: View ANY Teacher's schedule
exports.getTimetableForTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const data = await Timetable.find({ teacher: teacherId })
      .populate("classId", "name section")
      .sort({ day: 1, timeSlot: 1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Timetable Entry
exports.deleteTimetable = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Timetable Entry
exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, timeSlot, subject, classId, teacher } = req.body;

    // Check conflicts (excluding current slot)
    // For now, simple update
    const updated = await Timetable.findByIdAndUpdate(
      id,
      { day, timeSlot, subject, classId, teacher },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};