const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Generate Report Card Remarks (Teacher)
exports.generateRemark = async (req, res) => {
  try {
    const { studentName, subject, marks, totalMarks } = req.body;
    
    // --- FIX IS HERE: Changed "gemini-pro" to "gemini-1.5-flash" ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a teacher. Student: ${studentName}. Subject: ${subject}. Score: ${marks}/${totalMarks}.
      Write a 1-sentence encouraging remark for the report card.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ remark: response.text() });
  } catch (err) {
    console.error("AI Error:", err);
    // Fallback if AI fails completely
    res.json({ remark: "Great effort! Keep working hard." });
  }
};

// 2. Generate Notices (Admin)
exports.generateNotice = async (req, res) => {
  try {
    const { topic } = req.body;
    
    // --- FIX IS HERE: Changed "gemini-pro" to "gemini-1.5-flash" ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a School Principal. Write a formal notice board announcement about: "${topic}".
      - Keep it professional and concise (max 30 words).
      - Do not include "Subject:" line.
      - Just the body text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ content: response.text() });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ message: "AI Notice Generation Failed" });
  }
};