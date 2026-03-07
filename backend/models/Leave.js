const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    leaveType: {
        type: String,
        enum: ["Sick Leave", "Casual Leave", "Emergency", "Other"],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    adminComment: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
