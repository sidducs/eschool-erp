const Assignment = require("../models/Assignment");
const Class = require("../models/Class");


const createAssignment = async (req, res) => {
    try {
        const { title, description, classId, subject, dueDate } = req.body;

        // Validation
        if (!title || !classId || !subject || !dueDate) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }

        let attachment = null;
        let fileType = null;

        if (req.file) {
            attachment = req.file.path; // Cloudinary URL
            const fileExt = req.file.originalname.split('.').pop().toLowerCase();
            fileType = req.file.mimetype ? req.file.mimetype.split('/')[1] : fileExt;
            
            // Final fallback
            if (!fileType) fileType = fileExt || 'bin';
        }

        const assignment = await Assignment.create({
            title,
            description,
            classId,
            subject,
            teacherId: req.user._id,
            dueDate,
            attachment,
            fileType
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for a specific class (Student View)
// @route   GET /api/assignments/class/:classId
// @access  Student/Teacher
const getClassAssignments = async (req, res) => {
    try {
        if (!req.params.classId || req.params.classId === "undefined") {
            return res.status(400).json({ message: "Invalid Class ID" });
        }
        const assignments = await Assignment.find({ classId: req.params.classId })
            .populate("teacherId", "name")
            .sort({ dueDate: 1 }); // Sort by nearest due date
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments created by logged-in teacher
// @route   GET /api/assignments/teacher/my-assignments
// @access  Teacher
const getTeacherAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacherId: req.user._id })
            .populate("classId", "name section")
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Teacher
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Ensure only the creator can delete
        if (assignment.teacherId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this assignment" });
        }

        await assignment.deleteOne();
        res.json({ message: "Assignment removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    getClassAssignments,
    getTeacherAssignments,
    deleteAssignment
};
