const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    question: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["Unresolved", "Resolved"],
        default: "Unresolved"
    },
    answers: [{
        answeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        answerText: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Doubt", doubtSchema);
