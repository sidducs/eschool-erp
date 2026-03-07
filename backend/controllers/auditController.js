const AuditLog = require("../models/AuditLog");

// Get all logs (Admin only)
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("userId", "name email role")
            .sort({ timestamp: -1 })
            .limit(100); // Limit to last 100 logs
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Internal function to create log
const logAction = async (userId, action, details, ipAddress) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details,
            ipAddress
        });
    } catch (error) {
        console.error("Audit Log Error:", error);
    }
};

module.exports = { getAuditLogs, logAction };
