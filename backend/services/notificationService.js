const nodemailer = require("nodemailer");

// Configure Transporter with Real Credentials
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
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

        // ✅ Real Email Sending with 10s Timeout
        console.log(`[Email Attempt] To: ${to} | Subject: ${subject}`);
        
        const emailPromise = transporter.sendMail({ 
            from: `"ESchool ERP" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text 
        });

        // Timeout promise
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Email timeout after 10s")), 10000)
        );

        const info = await Promise.race([emailPromise, timeoutPromise]);

        console.log(`[Email Success] MessageId: ${info.messageId} | Recipient: ${to}`);
        return true;
    } catch (error) {
        console.error("[Email Failure]:", error.message);
        return false; // Return false so the rest of the request can complete
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
