const Notice = require("../models/Notice");

// Create (Admin Only)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, audience } = req.body;
    const notice = await Notice.create({
      title,
      content,
      audience,
      postedBy: req.user._id
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Notices
exports.getNotices = async (req, res) => {
  try {
    const role = req.user.role; 
    let filter = {};
    if (role !== "admin") {
      filter = { audience: { $in: ["all", role] } };
    }
    const notices = await Notice.find(filter).sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete
exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};