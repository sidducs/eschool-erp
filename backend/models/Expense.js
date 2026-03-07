const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String, 
        required: true
    },
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
