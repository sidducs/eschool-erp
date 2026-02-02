const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, ...otherDetails } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      ...otherDetails,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Force lowercase email just in case
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status, // Return status
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").populate("classId", "name section");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedUpdates = ["name", "fatherName", "motherName", "dob", "bloodGroup", "address", "phoneNumber", "documents"];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) user[key] = req.body[key];
    });

    // Handle Profile Picture Upload
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Handle documents properly if nested (simplified for now as replacing entire object or specific keys)
    if (req.body.documents) {
      // If sending as JSON string in FormData, parse it
      try {
        const docs = typeof req.body.documents === 'string' ? JSON.parse(req.body.documents) : req.body.documents;
        user.documents = { ...user.documents, ...docs };
      } catch (e) {
        console.error("Error parsing documents JSON", e);
      }
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile, changePassword };
