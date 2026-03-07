const mongoose = require("mongoose");

const quizResultSchema = mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        score: { type: Number, required: true },
        totalScore: { type: Number, required: true },
        answers: [{ type: Number }], // Array of selected option indices
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
