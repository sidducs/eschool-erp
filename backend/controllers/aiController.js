const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Initialize Gemini AI Model (FREE TIER)
 */
const getAIModel = () => {


  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env file");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // ✅ Free-tier supported model
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
};

/**
 * 1. Generate Timetable (Admin)
 */
exports.generateTimetable = async (req, res) => {


  try {
    const { teachers, className } = req.body;

    // ✅ Validate input
    if (!className || !teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({
        message: "className and teachers array are required",
      });
    }



    const model = getAIModel();

    const prompt = `
You are a School Administrator.

Create a weekly timetable (Monday to Saturday) for Class "${className}".

Rules:
- Skip Lunch (12:00 - 01:00)
- Use teachers: ${JSON.stringify(teachers)}
- Subjects: Maths, Science, English, Social, Hindi, Computer, PE
- Balance subjects evenly

Return ONLY a JSON array.

Format:
[
  {
    "day": "Monday",
    "timeSlot": "09:00 - 10:00",
    "subject": "Maths",
    "teacher": "TEACHER_ID"
  }
]
No explanation. No markdown.
`;



    const result = await model.generateContent(prompt);
    const response = await result.response;

    const rawText = response.text();



    // ✅ Clean AI output
    let cleanText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const match = cleanText.match(/\[.*\]/s);

    if (!match) {
      throw new Error("Invalid JSON returned by AI");
    }

    const timetable = JSON.parse(match[0]);

    res.status(200).json({ timetable });

  } catch (err) {
    console.error("AI Timetable Error:", err.stack || err);

    res.status(500).json({
      message: "Timetable generation failed",
      error: err.message,
    });
  }
};

/**
 * 2. Generate Report Card Remark (Teacher)
 */
exports.generateRemark = async (req, res) => {
  try {
    const { studentName, subject, marks, totalMarks } = req.body;

    if (!studentName || !subject) {
      return res.status(400).json({ message: "Missing data" });
    }

    const model = getAIModel();

    const prompt = `
Student: ${studentName}
Subject: ${subject}
Marks: ${marks}/${totalMarks}

Write ONE encouraging sentence.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.status(200).json({
      remark: response.text().trim(),
    });

  } catch (err) {
    console.error("AI Remark Error:", err);

    // Fallback
    res.status(200).json({
      remark: "Good effort. Keep improving!",
    });
  }
};

/**
 * 3. Generate Notice (Admin)
 */
exports.generateNotice = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const model = getAIModel();

    const prompt = `
Write a formal school notice about:
"${topic}"

Rules:
- Max 30 words
- No subject line
- Only body text
- Professional tone
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.status(200).json({
      content: response.text().trim(),
    });

  } catch (err) {
    console.error("AI Notice Error:", err);

    res.status(500).json({
      message: "Notice generation failed",
      error: err.message,
    });
  }
};
