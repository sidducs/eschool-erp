const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        institution: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ["New", "Replied"], default: "New" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
