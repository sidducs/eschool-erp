const PDFDocument = require("pdfkit");
const StudentFee = require("../models/StudentFee");

const generateFeeReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await StudentFee.findById(id)
      .populate("studentId", "name admissionId")
      .populate("classId", "name section");

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    // Use common logic (Internal helper)
    generatePDFContent(res, fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student download own receipt
const generateMyFeeReceipt = async (req, res) => {
  try {
    const studentId = req.user._id;

    const fee = await StudentFee.findOne({ studentId })
      .populate("studentId", "name admissionId")
      .populate("classId", "name section");

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    // Reuse common logic (Internal helper)
    generatePDFContent(res, fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generatePDFContent = (res, fee) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="Receipt_${fee.studentId.name}.pdf"`
  );

  doc.pipe(res);

  doc.fontSize(20).text("School Fee Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Student: ${fee.studentId.name}`);
  doc.text(`Admission ID: ${fee.studentId.admissionId || "N/A"}`);
  doc.text(`Class: ${fee.classId?.name || ""} ${fee.classId?.section || ""}`);

  doc.moveDown();
  doc.fontSize(14).text("Fee Breakdown", { underline: true });
  doc.moveDown(0.5);

  if (fee.breakdown && fee.breakdown.length > 0) {
    fee.breakdown.forEach((item) => {
      doc.fontSize(12).text(`${item.name}: ₹${item.amount.toLocaleString()}`);
    });
  } else {
    doc.fontSize(12).text(`Total Academic Fee: ₹${fee.totalFee.toLocaleString()}`);
  }

  doc.moveDown();
  doc.fontSize(12).font("Helvetica-Bold").text(`Total Payable: ₹${fee.totalFee.toLocaleString()}`);
  doc.fillColor("green").text(`Paid Amount: ₹${fee.paidAmount.toLocaleString()}`);

  const pending = fee.totalFee - fee.paidAmount;
  doc.fillColor(pending > 0 ? "red" : "green").text(`Pending Balance: ₹${pending.toLocaleString()}`);

  doc.fillColor("black").font("Helvetica").text(`Status: ${fee.status}`);

  doc.end();
};

module.exports = { generateFeeReceipt, generateMyFeeReceipt };