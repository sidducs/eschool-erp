const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");


const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, fileUrl } = req.body;

        if (!assignmentId || !fileUrl) {
            return res.status(400).json({ message: "Assignment ID and File URL are required" });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({
            assignmentId,
            studentId: req.user._id
        });

        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted this assignment" });
        }

        const submission = await Submission.create({
            assignmentId,
            studentId: req.user._id,
            fileUrl
        });

        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getSubmissionsForAssignment = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignmentId: req.params.id })
            .populate("studentId", "name admissionId")
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = "graded";

        await submission.save();

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user._id })
            .populate("assignmentId", "title dueDate");

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitAssignment,
    getSubmissionsForAssignment,
    gradeSubmission,
    getMySubmissions
};
