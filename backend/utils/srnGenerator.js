const SchoolSettings = require("../models/SchoolSettings");

const generateSRN = async () => {
    try {
        let settings = await SchoolSettings.findOne();
        if (!settings) {
            settings = await SchoolSettings.create({});
        }

        // Increment sequence
        settings.currentSequence += 1;
        await settings.save();

        // Format SRN
        // Format: [Prefix][Separator][Year][Separator][Padding+Sequence]
        // Example: ESA-24-0001

        let yearPart = "";
        const today = new Date();
        if (settings.srnYearFormat === "YYYY") {
            yearPart = today.getFullYear().toString();
        } else if (settings.srnYearFormat === "YY") {
            yearPart = today.getFullYear().toString().slice(-2);
        }

        const sequencePart = settings.currentSequence.toString().padStart(settings.srnPadding, "0");
        const sep = settings.srnSeparator || "";

        let parts = [];
        if (yearPart) parts.push(yearPart);
        if (settings.srnPrefix) parts.push(settings.srnPrefix);
        parts.push(sequencePart);

        return parts.join(sep);

    } catch (error) {
        console.error("SRN Generation Error:", error);
        // Fallback if DB fails? Better to throw so we don't create users with bad IDs
        throw new Error("Failed to generate Student ID");
    }
};

module.exports = { generateSRN };
