const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        type: { type: String, enum: ["holiday", "exam", "event", "meeting"], default: "event" },
        audience: { type: String, enum: ["all", "student", "teacher", "admin"], default: "all" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
