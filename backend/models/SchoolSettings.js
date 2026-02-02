const mongoose = require("mongoose");

const schoolSettingsSchema = new mongoose.Schema(
    {
        srnPrefix: { type: String, default: "ESA" },
        srnYearFormat: { type: String, enum: ["YYYY", "YY", "none"], default: "YY" }, // 2024, 24, or disabled
        srnSeparator: { type: String, default: "-" }, // - or / or empty
        srnPadding: { type: Number, default: 4 }, // Number of digits (e.g. 0005)
        currentSequence: { type: Number, default: 0 }, // Auto-incrementing counter

        // 🏫 School Details (Centralized Info)
        schoolName: { type: String, default: "ESchool Academy" },
        address: { type: String, default: "123 Education Lane, Knowledge City, Karnataka" },
        phone: { type: String, default: "9876543210" },
        email: { type: String, default: "info@eschool.com" },
        website: { type: String, default: "www.eschool.com" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SchoolSettings", schoolSettingsSchema);
