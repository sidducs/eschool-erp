const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true, unique: true }, // e.g., "KA-01-AB-1234"
    driverName: { type: String, required: true },
    driverContact: { type: String, required: true },
    capacity: { type: Number, required: true },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route"
    },
    currentLocation: { // For future simulation
        lat: Number,
        lng: Number
    }
}, { timestamps: true });

module.exports = mongoose.model("Transport", transportSchema);
