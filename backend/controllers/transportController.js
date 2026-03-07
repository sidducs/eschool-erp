const Route = require("../models/Route");
const Transport = require("../models/Transport");

const getRoutes = async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);
        res.status(201).json(route);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getVehicles = async (req, res) => {
    try {
        const vehicles = await Transport.find().populate("routeId");
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a vehicle
// @route   POST /api/transport/vehicles
// @access  Admin
const addVehicle = async (req, res) => {
    try {
        const vehicle = await Transport.create(req.body);
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/transport/vehicles/:id
// @access  Admin
const deleteVehicle = async (req, res) => {
    try {
        await Transport.findByIdAndDelete(req.params.id);
        res.json({ message: "Vehicle deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update vehicle location (Mock for Simulation)
// @route   PUT /api/transport/vehicles/:id/location
// @access  Admin/Driver
const updateLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const vehicle = await Transport.findByIdAndUpdate(
            req.params.id,
            { currentLocation: { lat, lng } },
            { new: true }
        );
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignTransport = async (req, res) => {
    try {
        const { studentId, routeId, stopName, transportFee } = req.body;
        const User = require("../models/User"); // Import here to avoid circular dependency if any, or just top
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.transport = {
            routeId,
            stopName,
            transportFee
        };
        await student.save();
        res.json({ message: "Transport assigned successfully", transport: student.transport });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoutes,
    addRoute,
    getVehicles,
    addVehicle,
    deleteVehicle,
    deleteVehicle,
    updateLocation,
    assignTransport
};
