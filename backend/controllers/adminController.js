const User = require("../models/User");
// GET all students (for teachers)
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "_id name email"
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    // prevent self-delete
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: "Admin cannot delete himself",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = req.body.role || user.role;
    user.classId = req.body.classId || user.classId;
    user.section = req.body.section || user.section;
    user.rollNumber = req.body.rollNumber || user.rollNumber;

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  getAllUsers,
  createUser,
  deleteUser,
  getAllStudents,
  updateUser,
};

