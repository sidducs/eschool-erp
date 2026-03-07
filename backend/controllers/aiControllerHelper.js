const User = require("../models/User");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");


const getWeakStudents = async (req, res) => {
    try {
        const students = await User.find({ role: "student", status: "active" });
        const weakStudents = [];

        for (const student of students) {
            // 1. Calculate Attendance
            let attendancePercent = 100;
            try {
                const totalDays = await Attendance.countDocuments({ studentId: student._id });
                const presentDays = await Attendance.countDocuments({ studentId: student._id, status: "Present" });
                attendancePercent = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;
            } catch (err) {
                // Ignore attendance error
            }

            // 2. Calculate Average Marks
            let avgMarks = 100;
            try {
                const results = await Result.find({ studentId: student._id });
                if (results.length > 0) {
                    const totalMarks = results.reduce((acc, curr) => acc + curr.marksObtained, 0);
                    avgMarks = totalMarks / results.length;
                }
            } catch (err) {
                // Ignore result error
            }

            // 3. Risk Criteria
            const riskFactors = [];
            if (attendancePercent < 75) riskFactors.push("Low Attendance (<75%)");
            if (avgMarks < 40) riskFactors.push("Poor Academic Performance (<40%)");

            if (riskFactors.length > 0) {
                weakStudents.push({
                    id: student._id,
                    name: student.name,
                    admissionId: student.admissionId,
                    attendance: attendancePercent.toFixed(1),
                    avgMarks: avgMarks.toFixed(1),
                    risks: riskFactors
                });
            }
        }

        res.json(weakStudents);
    } catch (error) {
        console.error("AI Helper Error:", error.message);
        // Return empty list instead of crashing or 500
        res.json([]);
    }
};

module.exports = { getWeakStudents };
