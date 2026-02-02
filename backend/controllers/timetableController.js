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

    // Check if slot is already occupied for this class
    const exists = await Timetable.findOne({ classId, day, timeSlot });
    if (exists) {
      return res.status(400).json({ message: `Time slot ${timeSlot} on ${day} is already occupied by '${exists.subject}'.` });
    }

    // Conflict Check: Is the Teacher busy elsewhere?
    const teacherBusy = await Timetable.findOne({ teacher, day, timeSlot }).populate("classId");
    if (teacherBusy) {
      const busyClass = teacherBusy.classId ? `${teacherBusy.classId.name}-${teacherBusy.classId.section}` : "another class";
      return res.status(409).json({ message: `Conflict: This teacher is already teaching in ${busyClass} at ${timeSlot} on ${day}!` });
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