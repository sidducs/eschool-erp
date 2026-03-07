const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
    try {
        // 1. Check if Credentials Exist
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("==================================================");
            console.log("⚠️  EMAIL SERVICE (MOCK MODE)");
            console.log(`TO: ${to}`);
            console.log(`SUBJECT: ${subject}`);
            console.log(`MESSAGE: ${text}`);
            console.log("==================================================");
            return { success: true, mock: true };
        }

        // 2. Configure Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // The School's Email
                pass: process.env.EMAIL_PASS, // App Password
            },
        });

        // 3. Send Email
        const info = await transporter.sendMail({
            from: `"ESchool ERP" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Email Error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;
