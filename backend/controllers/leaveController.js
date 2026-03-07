const Leave = require("../models/Leave");
const User = require("../models/User");


const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        const leave = await Leave.create({
            user: req.user._id,
            leaveType,
            startDate,
            endDate,
            reason
        });

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllLeaves = async (req, res) => {
    try {
        // Populate user details (name, rollNumber/SRN, role)
        const leaves = await Leave.find()
            .populate("user", "name admissionId role email")
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const { logAction } = require("./securityController"); // Import logger

// ...

const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leave = await Leave.findById(req.params.id).populate("user", "name");

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        if (status) leave.status = status;
        if (adminComment) leave.adminComment = adminComment;

        await leave.save();

        // 📝 Log Action
        await logAction(req.user._id, "LEAVE_UPDATE", `Updated leave for ${leave.user?.name} to ${status}`, req.ip);

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};
