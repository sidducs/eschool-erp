const PDFDocument = require("pdfkit");
const path = require("path");
const StudentFee = require("../models/StudentFee");

// Helper to sanitize filenames (remove spaces)
const getSafeName = (name) => name.replace(/\s+/g, "_");

// Admin download receipt
const generateFeeReceipt = async (req, res) => {
  try {
    const { studentId } = req.params;

    const fee = await StudentFee.findOne({ studentId })
      .populate("studentId", "name email")
      .populate("classId", "name section");

    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    const doc = new PDFDocument({ margin: 50 });
    const safeName = getSafeName(fee.studentId.name);

    res.setHeader("Content-Type", "application/pdf");
    // ✅ FIX: Dynamic Filename
    res.setHeader("Content-Disposition", `attachment; filename=Receipt_${safeName}.pdf`);

    doc.pipe(res);
    generatePDFContent(doc, fee); // Refactored content generation
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student download receipt
const generateMyFeeReceipt = async (req, res) => {
  try {
    const studentId = req.user._id;

    const fee = await StudentFee.findOne({ studentId })
      .populate("studentId", "name email")
      .populate("classId", "name section");

    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    const doc = new PDFDocument({ margin: 50 });
    const safeName = getSafeName(fee.studentId.name);

    res.setHeader("Content-Type", "application/pdf");
    // ✅ FIX: Dynamic Filename
    res.setHeader("Content-Disposition", `attachment; filename=Receipt_${safeName}.pdf`);

    doc.pipe(res);
    generatePDFContent(doc, fee);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const SchoolSettings = require("../models/SchoolSettings");

// Helper function to draw PDF content (Shared by both)
const generatePDFContent = async (doc, fee) => {
  // Fetch School Settings
  let settings = await SchoolSettings.findOne();
  if (!settings) settings = {}; // Fallback to schema defaults if not found

  const schoolName = settings.schoolName || "ESchool Academy";
  const schoolAddress = settings.address || "123 Education Lane, Knowledge City";
  const schoolPhone = settings.phone || "9876543210";

  const logoPath = path.join(__dirname, "../assets/logo.png");

  // -- HEADER --
  // Logo
  try { doc.image(logoPath, 50, 45, { width: 60 }); } catch { }

  // School Name & Address
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(schoolName, 120, 45, { align: "left" })
    .fillColor("#444444")
    .fontSize(10)
    .text(schoolAddress, 120, 70, { align: "left" })
    .text(`Phone: ${schoolPhone}`, 120, 85, { align: "left" });

  // Divider Line
  doc.moveDown(2);
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke();

  // -- TITLE --
  doc.moveDown(1.5);
  doc
    .fillColor("#000000")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("OFFICIAL FEE RECEIPT", { align: "center", letterSpacing: 2 });

  // -- RECIEPT DETAILS --
  doc.moveDown(1.5);
  const startY = doc.y;

  // Box for Details
  doc.rect(50, startY, 500, 160).stroke();

  // Left Column (Labels)
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#333333");
  doc.text("Receipt ID:", 70, startY + 20);
  doc.text("Date:", 300, startY + 20); // Right side

  doc.text("Student Name:", 70, startY + 50);
  doc.text("SRN (Admission No):", 70, startY + 75);
  doc.text("Class:", 70, startY + 100);

  // Right Column (Values)
  doc.font("Helvetica").fillColor("#000000");
  doc.text(fee._id.toString().slice(-8).toUpperCase(), 180, startY + 20);
  doc.text(new Date().toLocaleDateString(), 350, startY + 20);

  doc.text(fee.studentId.name, 180, startY + 50);
  doc.text(fee.studentId.admissionId || "N/A", 180, startY + 75);
  doc.text(`${fee.classId?.name || ""} ${fee.classId?.section || ""}`, 180, startY + 100);

  // -- FINANCIALS --
  doc.moveDown(6);
  const tableTop = doc.y + 20;

  // Table Header
  doc.rect(50, tableTop, 500, 30).fill("#f0f0f0").stroke();
  doc.fillColor("#000000").font("Helvetica-Bold").text("Description", 70, tableTop + 10);
  doc.text("Amount (Rs.)", 400, tableTop + 10, { align: "right", width: 130 });

  // Table Row 1: Total Fee
  doc.rect(50, tableTop + 30, 500, 30).stroke();
  doc.font("Helvetica").text("Total Academic Fee", 70, tableTop + 40);
  doc.text(fee.totalFee.toLocaleString(), 400, tableTop + 40, { align: "right", width: 130 });

  // Table Row 2: Paid Amount
  doc.rect(50, tableTop + 60, 500, 30).stroke();
  doc.font("Helvetica").text("Amount Paid", 70, tableTop + 70);
  doc.fillColor("#008000").text("- " + fee.paidAmount.toLocaleString(), 400, tableTop + 70, { align: "right", width: 130 });

  // Table Row 3: Pending
  doc.rect(50, tableTop + 90, 500, 30).stroke();
  doc.fillColor("#000000").font("Helvetica").text("Pending Balance", 70, tableTop + 100);
  const pending = fee.totalFee - fee.paidAmount;
  doc.fillColor(pending > 0 ? "#FF0000" : "#000000").text(pending.toLocaleString(), 400, tableTop + 100, { align: "right", width: 130 });

  // Status Badge
  doc.moveDown(4);
  const statusColor = fee.status === "Paid" ? "#d4edda" : "#f8d7da";
  const statusTextColor = fee.status === "Paid" ? "#155724" : "#721c24";

  doc.rect(50, doc.y, 500, 40).fill(statusColor);
  doc.fillColor(statusTextColor).font("Helvetica-Bold").fontSize(12)
    .text(`Payment Status: ${fee.status.toUpperCase()}`, 50, doc.y - 25, { align: "center", width: 500 });

  // -- FOOTER --
  doc.moveDown(4);
  doc.fillColor("#777777").fontSize(10)
    .text("Thank you for your payment.", { align: "center" });
  doc.text("This receipt is system generated and does not require a signature.", { align: "center" });
};

module.exports = { generateFeeReceipt, generateMyFeeReceipt };