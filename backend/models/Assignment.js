const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    attachment: {
        type: String,
        default: null,
    },
    fileType: {
        type: String, 
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
