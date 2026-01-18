const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const bulkUploadStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file required" });
  }

  const students = [];

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        students.push({
          name: row.name,
          email: row.email,
          password: row.password || "student123",
          role: "student",
          section: row.section,
          rollNumber: row.rollNumber,
        });
      })
      .on("end", async () => {
        try {
          // 🔐 Hash passwords here
          for (let s of students) {
            const salt = await bcrypt.genSalt(10);
            s.password = await bcrypt.hash(s.password, salt);
          }

          const result = await User.insertMany(students);

          fs.unlinkSync(req.file.path);

          res.json({
            message: "Students uploaded successfully",
            count: result.length,
          });
        } catch (err) {
          console.error("Insert error:", err);
          res.status(500).json({ message: "DB insert failed" });
        }
      });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: "Bulk upload failed" });
  }
};

module.exports = { bulkUploadStudents };
