const User = require("../models/User");
const mongoose = require("mongoose");

// Get linked children's details
const getChildren = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id).populate({
            path: "children",
            select: "name admissionId classId section rollNumber profilePicture attendance examResults",
            populate: { path: "classId", select: "name section" }
        });

        if (!parent) return res.status(404).json({ message: "Parent not found" });

        res.json(parent.children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔐 TC-PAR-03: Ownership check helper — verify student belongs to this parent
const verifyChildOwnership = async (parentId, studentId) => {
    if (!mongoose.Types.ObjectId.isValid(studentId)) return false;
    const parent = await User.findById(parentId).select("children");
    if (!parent) return false;
    return parent.children.some(childId => childId.toString() === studentId.toString());
};

module.exports = { getChildren, verifyChildOwnership };
