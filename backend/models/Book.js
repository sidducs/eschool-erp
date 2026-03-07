const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true, required: true },
  category: { type: String },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  location: { type: String },
  pdfUrl: { type: String, default: null }, // Vector
  embedding: { type: [Number] },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);