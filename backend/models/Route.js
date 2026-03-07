const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
    routeId: { type: String, required: true, unique: true }, // e.g., "R-01"
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    stops: [{
        name: { type: String, required: true },
        pickupTime: { type: String, required: true }, // e.g., "07:30 AM"
        fees: { type: Number, required: true } // Fee for this stop
    }],
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transport"
    }
}, { timestamps: true });

module.exports = mongoose.model("Route", routeSchema);
