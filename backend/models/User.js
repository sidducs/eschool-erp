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
      select: false, // 🔐 TC-SEC-03: Never return password in queries by default
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent", "accountant"],
      default: "student",
    },

    // 👨‍👩‍👧 Parent: Linked Children
    children: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

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
    parentEmail: { type: String, default: null }, // For notifications
    parentPhoneNumber: { type: String, default: null }, // For SMS/WhatsApp (Future)

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

    // 🚌 Transport Details
    transport: {
      routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", default: null },
      stopName: { type: String, default: null },
      transportFee: { type: Number, default: 0 }
    },

    // 🔐 Password Reset Fields
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false }
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
