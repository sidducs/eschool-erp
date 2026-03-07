const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const feeRoutes = require("./routes/feeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const cron = require("node-cron");
const Transaction = require("./models/Transaction");
const libraryRoutes = require("./routes/libraryRoutes"); // 
dotenv.config();
connectDB();

const app = express();
cron.schedule("0 0 * * *", async () => {
  console.log("Running Daily Fine Calculation...");
  const today = new Date();

  // Find all books not returned and past due date
  const overdueBooks = await Transaction.find({
    status: 'Issued',
    dueDate: { $lt: today }
  });

  overdueBooks.forEach(async (record) => {
    const daysLate = Math.floor((today - record.dueDate) / (1000 * 60 * 60 * 24));
    record.fine = daysLate * 10; // 10 Rupees per day
    await record.save();
  });
});
// Middleware
const rawOrigin = process.env.FRONTEND_URL || "";

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin includes 'localhost' or the core frontend domain
    if (origin.includes('localhost') || origin.includes('vercel.app') || (rawOrigin && origin.includes(rawOrigin.replace('https://', '').replace('http://', '').replace('/', '')))) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/parent", require("./routes/parentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/bulk-upload", require("./routes/bulkUploadRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/events", require("./routes/eventRoutes")); // Added Event Routes
app.use("/api/notices", noticeRoutes);
app.use("/api/library", require("./routes/libraryRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/common", require("./routes/commonRoutes"));
app.use("/api/doubts", require("./routes/doubtRoutes"));
app.use("/api/finance", require("./routes/financeRoutes"));
app.use("/api/transport", require("./routes/transportRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.get("/", (req, res) => {
  res.send("ESchool API is running...");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
