const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const Class = require("../models/Class");
const StudentFee = require("../models/StudentFee");
const Notice = require("../models/Notice");
const archiver = require("archiver");


const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("userId", "name role")
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch logs" });
    }
};


const downloadBackup = async (req, res) => {
    try {
        const users = await User.find();
        const classes = await Class.find();
        const fees = await StudentFee.find();
        const notices = await Notice.find();
        const logs = await AuditLog.find();

        const archive = archiver("zip", { zlib: { level: 9 } });

        res.attachment("eschool_backup_" + new Date().toISOString().split('T')[0] + ".zip");
        archive.pipe(res);

        archive.append(JSON.stringify(users, null, 2), { name: "users.json" });
        archive.append(JSON.stringify(classes, null, 2), { name: "classes.json" });
        archive.append(JSON.stringify(fees, null, 2), { name: "fees.json" });
        archive.append(JSON.stringify(notices, null, 2), { name: "notices.json" });
        archive.append(JSON.stringify(logs, null, 2), { name: "audit_logs.json" });

        await archive.finalize();

        // Log this action
        await AuditLog.create({
            userId: req.user._id,
            action: "DATA_BACKUP",
            details: "Downloaded full system backup",
            ipAddress: req.ip
        });

    } catch (error) {
        console.error("Backup Failed:", error);
        res.status(500).json({ message: "Backup generation failed" });
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

module.exports = { getAuditLogs, downloadBackup, logAction };
