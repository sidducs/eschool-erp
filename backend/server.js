// Backend Server
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const feeRoutes = require("./routes/feeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const cron = require("node-cron");
const Transaction = require("./models/Transaction");
const libraryRoutes = require("./routes/libraryRoutes");
const { globalLimiter } = require("./middleware/rateLimiter");
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
// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://eschool-erp.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(mongoSanitize()); // 🔐 TC-AUTH-06: Strip MongoDB operators from input
app.use("/api", globalLimiter); // 🔐 TC-SEC-04: Global rate limiting

// Static Files
const path = require('path');
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/api/inquiries", require("./routes/inquiryRoutes"));
app.get("/", (req, res) => {
  res.send("ESchool API is running...");
});

// 🔐 TC-SEC-02: 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    // Socket disconnected
  });
});

// Make io accessible in routes
app.set("socketio", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Register Automated Jobs
require('./jobs/feeReminderJob');
require('./jobs/examReminderJob');

// 🔐 TC-SEC-02: Global error handler — MUST have 4 params
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack); // log internally only

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({ message: messages.join(', ') });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: 'CORS policy violation' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
});
