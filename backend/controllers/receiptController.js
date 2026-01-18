// const PDFDocument = require("pdfkit");
// const path = require("path");
// const StudentFee = require("../models/StudentFee");

// // ================================
// // ADMIN → DOWNLOAD ANY STUDENT RECEIPT
// // ================================
// const generateFeeReceipt = async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const fee = await StudentFee.findOne({ studentId })
//       .populate("studentId", "name email")
//       .populate("classId", "name section");

//     if (!fee) {
//       return res.status(404).json({ message: "Fee record not found" });
//     }

//     const doc = new PDFDocument({ margin: 50 });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=fee-receipt-${fee.studentId.name}.pdf`
//     );

//     doc.pipe(res);

//     // ===== LOGO & BRANDING =====
//     const logoPath = path.join(__dirname, "../assets/logo.png");

//     try {
//       doc.image(logoPath, 50, 40, { width: 70 });
//     } catch {
//       // ignore logo error if file missing
//     }

//     doc.fontSize(20).text("ESchool Management System", 140, 45);
//     doc
//       .fontSize(10)
//       .text(
//         "123, Main Road, Karnataka | Phone: 9731556441",
//         140,
//         70
//       );

//     doc.moveDown(4);

//     // ===== RECEIPT TITLE =====
//     doc.fontSize(18).text("Fee Receipt", { align: "center" });
//     doc.moveDown();

//     // ===== DATE =====
//     doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
//     doc.moveDown();

//     // ===== STUDENT DETAILS =====
//     doc.fontSize(14).text("Student Details");
//     doc.moveDown(0.5);

//     doc.fontSize(12);
//     doc.text(`Name: ${fee.studentId.name}`);
//     doc.text(`Email: ${fee.studentId.email}`);
//     doc.text(`Class: ${fee.classId.name} ${fee.classId.section}`);
//     doc.moveDown();

//     // ===== FEE DETAILS =====
//     doc.fontSize(14).text("Fee Details");
//     doc.moveDown(0.5);

//     doc.fontSize(12);
//     doc.text(`Total Fee (Rs): ${fee.totalFee}  `);
//     doc.text(`Paid Amount (Rs): ${fee.paidAmount} `);
//     doc.text(`Pending Amount (Rs): ${fee.totalFee - fee.paidAmount} `);
//     doc.text(`Status: ${fee.status}`);

//     doc.moveDown(3);

//     // ===== FOOTER =====
//     doc
//       .fontSize(10)
//       .text(
//         "This is a system-generated receipt. No signature required.",
//         { align: "center" }
//       );

//     doc.end();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ================================
// // STUDENT → DOWNLOAD OWN RECEIPT
// // ================================
// const generateMyFeeReceipt = async (req, res) => {
//   try {
//     const studentId = req.user._id;

//     const fee = await StudentFee.findOne({ studentId })
//       .populate("studentId", "name email")
//       .populate("classId", "name section");

//     if (!fee) {
//       return res.status(404).json({ message: "Fee record not found" });
//     }

//     const doc = new PDFDocument({ margin: 50 });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=my-fee-receipt.pdf`
//     );

//     doc.pipe(res);

//     // ===== LOGO & BRANDING =====
//     const logoPath = path.join(__dirname, "../assets/logo.png");

//     try {
//       doc.image(logoPath, 50, 40, { width: 70 });
//     } catch {
//       // ignore logo error if file missing
//     }

//     doc.fontSize(20).text("ESchool Management System",{ align: "center" }, 140, 45);
//     doc
//       .fontSize(10)
//       .text(
//         "123, Main Road, Karnataka | Phone: 9876543210",{ align: "center" },
//         140,
//         70
//       );

//     doc.moveDown(4);

//     // ===== RECEIPT TITLE =====
//     doc.fontSize(18).text("Fee Receipt", { align: "center" });
//     doc.moveDown();

//     // ===== DATE =====
//     doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
//     doc.moveDown();

//     // ===== STUDENT DETAILS =====
//     doc.fontSize(14).text("Student Details");
//     doc.moveDown(0.5);

//     doc.fontSize(12);
//     doc.text(`Name: ${fee.studentId.name}`);
//     doc.text(`Email: ${fee.studentId.email}`);
//     doc.text(`Class: ${fee.classId.name} ${fee.classId.section}`);
//     doc.moveDown();

//     // ===== FEE DETAILS =====
//     doc.fontSize(14).text("Fee Details");
//     doc.moveDown(0.5);

//     doc.fontSize(12);
//     doc.text(`Total Fee: Rs:${fee.totalFee}`);
//     doc.text(`Paid Amount: Rs:${fee.paidAmount}`);
//     doc.text(`Pending Amount: Rs:${fee.totalFee - fee.paidAmount}`);
//     doc.text(`Status: ${fee.status}`);

//     doc.moveDown(3);

//     // ===== FOOTER =====
//     doc
//       .fontSize(10)
//       .text(
//         "This is a system-generated receipt. No signature required.",
//         { align: "center" }
//       );

//     doc.end();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   generateFeeReceipt,
//   generateMyFeeReceipt,
// };
const PDFDocument = require("pdfkit");
const path = require("path");
const StudentFee = require("../models/StudentFee");

// Helper to sanitize filenames (remove spaces)
const getSafeName = (name) => name.replace(/\s+/g, "_");

// ================================
// ADMIN → DOWNLOAD ANY STUDENT RECEIPT
// ================================
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

// ================================
// STUDENT → DOWNLOAD OWN RECEIPT
// ================================
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

// Helper function to draw PDF content (Shared by both)
const generatePDFContent = (doc, fee) => {
    const logoPath = path.join(__dirname, "../assets/logo.png");
    try { doc.image(logoPath, 50, 40, { width: 70 }); } catch {}

    doc.fontSize(20).text("eSchool Management System", { align: "center" });
    doc.fontSize(10).text("123, Main Road, Karnataka | Phone: 9731556441", { align: "center" });
    doc.moveDown(4);

    doc.fontSize(18).text("Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text("Student Details");
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Name: ${fee.studentId.name}`);
    doc.text(`Email: ${fee.studentId.email}`);
    doc.text(`Class: ${fee.classId?.name} ${fee.classId?.section}`); // Safe check ?.
    doc.moveDown();

    doc.fontSize(14).text("Fee Details");
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total Fee: Rs. ${fee.totalFee}`);
    doc.text(`Paid Amount: Rs. ${fee.paidAmount}`);
    doc.text(`Pending Amount: Rs. ${fee.totalFee - fee.paidAmount}`);
    doc.text(`Status: ${fee.status}`);

    doc.moveDown(3);
    doc.fontSize(10).text("This is a system-generated receipt. No signature required.", { align: "center" });
};

module.exports = { generateFeeReceipt, generateMyFeeReceipt };