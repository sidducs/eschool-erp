
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { 
    type: String, 
    enum: ["all", "teacher", "student"], 
    default: "all" 
  },
  date: { type: Date, default: Date.now },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Notice", noticeSchema);