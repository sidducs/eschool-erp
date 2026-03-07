const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getRoutes,
    addRoute,
    getVehicles,
    addVehicle,

    deleteVehicle,
    updateLocation,
    assignTransport
} = require("../controllers/transportController");

// Public/Shared
router.get("/routes", protect, getRoutes);
router.get("/vehicles", protect, getVehicles);

// Admin Only
router.post("/routes", protect, authorize("admin"), addRoute);
router.post("/vehicles", protect, authorize("admin"), addVehicle);
router.post("/assign", protect, authorize("admin"), assignTransport);
router.delete("/vehicles/:id", protect, authorize("admin"), deleteVehicle);

// Simulation
router.put("/vehicles/:id/location", protect, authorize("admin"), updateLocation);

module.exports = router;
