const User = require("../models/User");
// GET all students (for teachers)
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .populate("classId", "name section"); // Populate class details if assigned
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

const { generateSRN } = require("../utils/srnGenerator");

// CREATE user
const createUser = async (req, res) => {
  try {
    const {
      name, email, password, role,
      fatherName, motherName, dob, bloodGroup, address, phoneNumber,
      classId, section, rollNumber
    } = req.body;

    let { admissionId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Auto-generate SRN for students if not provided
    if (role === "student" && !admissionId) {
      admissionId = await generateSRN();
    }

    // Check admission ID uniqueness if provided or generated
    if (admissionId) {
      const admissionExists = await User.findOne({ admissionId });
      if (admissionExists) {
        return res.status(400).json({ message: `Admission ID ${admissionId} is already taken.` });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      fatherName, motherName, dob, bloodGroup, address, phoneNumber,
      admissionId, classId, section, rollNumber
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      admissionId: user.admissionId
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



// APPROVE Student (Hybrid Flow)
const approveStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "student") return res.status(400).json({ message: "Only students can be approved" });

    const { classId, section } = req.body;

    // Auto specific SRN generation
    const admissionId = await generateSRN();

    user.classId = classId;
    user.section = section;
    user.admissionId = admissionId;
    user.status = "active";

    await user.save();

    res.json({ message: "Student Approved", student: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET Password (Admin override)
const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = req.body.password; // Will be hashed
    await user.save();

    res.json({ message: `Password reset successfully for ${user.name}` });
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
  approveStudent,
  resetPassword,
};

