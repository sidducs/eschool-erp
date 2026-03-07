const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    month: {
        type: String, // e.g., "October 2023"
        required: true
    },
    salaryAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },
    paymentDate: Date,
    remarks: String
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);
