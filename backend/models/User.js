const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },

    // 🚦 Account Status (For Hybrid Registration)
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending", // Students start as pending until approved
    },

    // 🎓 Student-specific fields
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },

    section: {
      type: String,
      default: null,
    },

    rollNumber: {
      type: Number,
      default: null,
    },

    // 📌 Personal Details
    fatherName: { type: String, default: null },
    motherName: { type: String, default: null },
    dob: { type: Date, default: null },
    bloodGroup: { type: String, default: null },
    address: { type: String, default: null },
    phoneNumber: { type: String, default: null },

    // 🏫 Admission Details
    admissionId: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined for non-students
    },

    // 📂 Documents
    profilePicture: { type: String, default: null },
    documents: {
      transferCertificate: { type: String, default: null },
      previousMarksheet: { type: String, default: null },
      birthCertificate: { type: String, default: null }
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
