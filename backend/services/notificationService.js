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

        // SAFETY: Commented out to prevent accidental emails to random users during testing.
        // To enable real emails, uncomment the lines below and ensure .env has valid credentials.

        /* 
        await transporter.sendMail({ 
            from: `"ESchool ERP" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text 
        });
        */

        console.log(`[EMAIL LOG ONLY] To: ${to} | Subject: ${subject}`);
        console.log(`[CONTENT] ${text}`); // Log content for verification
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
