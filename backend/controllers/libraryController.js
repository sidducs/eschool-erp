const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
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
    const { title, author, isbn, description, category, totalCopies, location, pdfUrl } = req.body;
    const embedding = await getAIEmbedding(`${title} ${description} ${category}`);

    const newBook = new Book({
      title, author, isbn, description, category,
      totalCopies, availableCopies: totalCopies, location, pdfUrl,
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
    const { query, sort } = req.query;

    let filter = {};
    if (query) {
      const regex = new RegExp(query, 'i');
      filter = {
        $or: [
          { title: regex },
          { author: regex },
          { isbn: regex },
          { category: regex }
        ]
      };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "title_asc") sortOption = { title: 1 };
    if (sort === "title_desc") sortOption = { title: -1 };
    if (sort === "author_asc") sortOption = { author: 1 };
    if (sort === "available") sortOption = { availableCopies: -1 };

    const results = await Book.find(filter).sort(sortOption).limit(100);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed." });
  }
};

exports.getMyBooks = async (req, res) => {
  try {
    // History of books issued to the logged-in user
    const transactions = await Transaction.find({
      studentId: req.user._id,
      status: 'Issued'
    }).populate("bookId").sort({ dueDate: 1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, admissionId } = req.body;

    // Find Book
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: "Book is not available" });
    }

    const searchId = admissionId || req.body.rollNumber;
    const student = await User.findOne({ admissionId: searchId, role: "student" });

    if (!student) {
      return res.status(404).json({ message: `Student with SRN '${searchId}' not found.` });
    }

    // Check if already issued
    const alreadyIssued = await Transaction.findOne({
      bookId,
      studentId: student._id,
      status: "Issued"
    });

    if (alreadyIssued) {
      return res.status(400).json({ message: "Student already has this book issued." });
    }

    // Create Transaction
    await Transaction.create({
      bookId,
      studentId: student._id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Decrement copies
    book.availableCopies -= 1;
    await book.save();

    res.json({ message: `Success: Issued to ${student.name}`, dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) });
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