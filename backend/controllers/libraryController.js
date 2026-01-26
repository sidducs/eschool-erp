const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // ✅ CRITICAL: Added this import
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAIEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("AI Embedding Error:", error);
    throw new Error("Failed to generate AI embedding.");
  }
};

exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, description, category, totalCopies, location } = req.body;
    const embedding = await getAIEmbedding(`${title} ${description} ${category}`);

    const newBook = new Book({
      title, author, isbn, description, category,
      totalCopies, availableCopies: totalCopies, location,
      embedding: embedding 
    });

    await newBook.save();
    res.status(201).json({ message: "Book added and AI indexed successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.smartSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query is required" });
    const queryVector = await getAIEmbedding(query);

    const results = await Book.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 10
        }
      },
      { $project: { embedding: 0, score: { $meta: "vectorSearchScore" } } }
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed. Check Atlas Index." });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, rollNumber } = req.body;

    // Convert rollNumber to Number for comparison
    const student = await User.findOne({ rollNumber: Number(rollNumber), role: 'student' });

    if (!student) {
      return res.status(404).json({ message: "No student found with this Roll Number." });
    }

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: "Book is not available." });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const transaction = new Transaction({
      bookId,
      studentId: student._id,
      dueDate,
      status: 'Issued'
    });

    book.availableCopies -= 1;
    await book.save();
    await transaction.save();

    res.json({ message: `Success: Issued to ${student.name}`, dueDate });
  } catch (err) {
    console.error("Issuance Error:", err);
    res.status(500).json({ message: "Server error during issuance: " + err.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { bookId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.status === 'Returned') {
      return res.status(400).json({ message: "Invalid transaction." });
    }

    const today = new Date();
    if (today > transaction.dueDate) {
      const diffDays = Math.ceil(Math.abs(today - transaction.dueDate) / (1000 * 60 * 60 * 24));
      transaction.fine = diffDays * 10;
    }

    transaction.status = 'Returned';
    transaction.returnDate = today;
    await transaction.save();

    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
    res.json({ message: "Book returned!", fine: transaction.fine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("bookId", "title author")
      .populate("studentId", "name email rollNumber")
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};