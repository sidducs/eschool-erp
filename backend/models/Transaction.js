const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  fine: { type: Number, default: 0 },
  status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' }
}, { timestamps: true });

// ✅ MAKE SURE THIS LINE IS PRESENT
module.exports = mongoose.model("Transaction", transactionSchema);