const Doubt = require("../models/Doubt");

const createDoubt = async (req, res) => {
    try {
        const { question, subject, description } = req.body;
        const doubt = await Doubt.create({
            studentId: req.user._id,
            question,
            subject,
            description
        });
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: "Failed to post doubt" });
    }
};


const getDoubts = async (req, res) => {
    try {
        const doubts = await Doubt.find()
            .populate("studentId", "name email")
            .populate("answers.answeredBy", "name role")
            .sort({ createdAt: -1 });
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch doubts" });
    }
};

const answerDoubt = async (req, res) => {
    try {
        const { answerText } = req.body;
        const doubt = await Doubt.findById(req.params.id);

        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found" });
        }

        if (!answerText) {
            return res.status(400).json({ message: "Answer text is required" });
        }

        const newAnswer = {
            answeredBy: req.user._id,
            answerText
        };

        doubt.answers.push(newAnswer);
        doubt.status = "Resolved"; // Auto-mark as resolved when answered
        await doubt.save();

        res.json(doubt);
    } catch (error) {
        console.error("Error answering doubt:", error);
        res.status(500).json({ message: "Failed to post answer", error: error.message });
    }
};

const deleteDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found" });
        }

        // Check ownership or admin role
        if (doubt.studentId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(401).json({ message: "Not authorized" });
        }

        await doubt.deleteOne();
        res.json({ message: "Doubt removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete doubt" });
    }
};

module.exports = { createDoubt, getDoubts, answerDoubt, deleteDoubt };
