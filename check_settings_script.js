const mongoose = require("mongoose");
const SchoolSettings = require("./backend/models/SchoolSettings");
require("dotenv").config({ path: "./backend/.env" });

const checkSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const settings = await SchoolSettings.findOne();
        console.log("Current Settings in DB:", settings);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkSettings();
