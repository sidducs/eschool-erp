const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes"); // <--- Import
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
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
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
app.use("/api/ai", aiRoutes); 
app.use("/api/notices", noticeRoutes);
app.use("/api/library", require("./routes/libraryRoutes"));
app.get("/", (req, res) => {
  res.send("ESchool API is running...");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
