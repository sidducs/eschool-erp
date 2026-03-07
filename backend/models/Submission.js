const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["submitted", "graded"],
        default: "submitted"
    },
    grade: {
        type: String, // Can be "A", "85/100", etc.
        default: null
    },
    feedback: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
