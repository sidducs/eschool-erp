const SchoolSettings = require("../models/SchoolSettings");

// Get school settings
const getSettings = async (req, res) => {
    try {
        let settings = await SchoolSettings.findOne();
        if (!settings) {
            settings = await SchoolSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update school settings
const updateSettings = async (req, res) => {
    try {
        const { srnPrefix, srnYearFormat, srnSeparator, currentSequence } = req.body;

        let settings = await SchoolSettings.findOne();
        if (!settings) {
            settings = new SchoolSettings();
        }

        if (srnPrefix !== undefined) settings.srnPrefix = srnPrefix;
        if (srnYearFormat !== undefined) settings.srnYearFormat = srnYearFormat;
        if (srnYearFormat !== undefined) settings.srnYearFormat = srnYearFormat;
        if (srnSeparator !== undefined) settings.srnSeparator = srnSeparator;
        if (req.body.srnPadding !== undefined) settings.srnPadding = Number(req.body.srnPadding);
        if (currentSequence !== undefined) settings.currentSequence = Number(currentSequence);

        // Update School Info
        if (req.body.schoolName !== undefined) settings.schoolName = req.body.schoolName;
        if (req.body.address !== undefined) settings.address = req.body.address;
        if (req.body.phone !== undefined) settings.phone = req.body.phone;
        if (req.body.email !== undefined) settings.email = req.body.email;
        if (req.body.website !== undefined) settings.website = req.body.website;

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
