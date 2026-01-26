const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true, required: true },
  category: { type: String },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  location: { type: String }, // e.g., "Shelf A-1"
  embedding: { type: [Number] }, // For AI Vector Search
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);