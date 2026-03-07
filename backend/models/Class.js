const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String, 
      required: true,
    },
    section: {
      type: String, 
      required: true,
    },
    academicYear: {
      type: String, 
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
