const mongoose = require("mongoose");

const quizSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: [
            {
                questionText: { type: String, required: true },
                options: [{ type: String, required: true }], // Array of 4 strings
                correctOption: { type: Number, required: true }, // Index 0, 1, 2, or 3
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
