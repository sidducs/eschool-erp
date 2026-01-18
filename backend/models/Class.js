const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String, // e.g. "10"
      required: true,
    },
    section: {
      type: String, // e.g. "A"
      required: true,
    },
    academicYear: {
      type: String, // e.g. "2025-26"
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
