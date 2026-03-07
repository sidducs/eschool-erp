const User = require("../models/User");

//     Get linked children's details
const getChildren = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id).populate({
            path: "children",
            select: "name admissionId classId section rollNumber profilePicture attendance examResults",
            populate: { path: "classId", select: "name section" } // Deep populate class details
        });

        if (!parent) return res.status(404).json({ message: "Parent not found" });

        res.json(parent.children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getChildren };
