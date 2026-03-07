const nodemailer = require("nodemailer");

// Configure Transporter with Real Credentials
const transporter = nodemailer.createTransport({
    service: "gmail", // Using Gmail service wrapper for simplicity
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        if (!to || !to.includes("@")) {
            console.log(`[Email Skipped] Invalid email: ${to}`);
            return;
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("[Email Error] Missing EMAIL_USER or EMAIL_PASS in .env");
            return false;
        }

        // ✅ Real Email Sending Enabled
        await transporter.sendMail({ 
            from: `"ESchool ERP" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text 
        });

        console.log(`[Email Sent] To: ${to} | Subject: ${subject}`);
        return true;
    } catch (error) {
        console.error("Email Error:", error);
        return false;
    }
};

const sendSMS = async (phone, message) => {
    try {
        if (!phone) return;
        // Placeholder for SMS Gateway (Twilio/Fast2SMS)
        console.log(`[SMS SENT] To: ${phone} | Message: ${message}`);
        return true;
    } catch (error) {
        console.error("SMS Error:", error);
        return false;
    }
};

module.exports = { sendEmail, sendSMS };
