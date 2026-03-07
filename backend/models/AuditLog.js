const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "DELETE_USER", "UPDATE_FEE"
    details: { type: String }, // e.g., "Deleted user John Doe"
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
