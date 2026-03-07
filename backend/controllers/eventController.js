const Event = require("../models/Event");


const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ startDate: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch events" });
    }
};


const createEvent = async (req, res) => {
    try {
        const { title, description, startDate, endDate, type, audience } = req.body;

        const event = new Event({
            title,
            description,
            startDate,
            endDate,
            type,
            audience,
            createdBy: req.user._id
        });

        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ message: "Failed to create event", error: error.message });
    }
};


const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        await event.deleteOne();
        res.json({ message: "Event removed" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete event" });
    }
};

module.exports = { getEvents, createEvent, deleteEvent };
