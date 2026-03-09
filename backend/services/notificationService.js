const nodemailer = require("nodemailer");

// 🌐 Configure Transporter with Mock Mode Fallback
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️  EMAIL_USER or EMAIL_PASS missing. Email Service will run in MOCK MODE.");
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const transporter = createTransporter();

// Verify connection if not in mock mode
if (transporter) {
    transporter.verify((error) => {
        if (error) {
            console.error("❌ Email service initialization failed:", error.message);
        } else {
            console.log("✅ Email service is ready to send.");
        }
    });
}

/**
 * 📧 Send Email with standardized logic
 */
const sendEmail = async (to, subject, text, htmlContent = null) => {
    try {
        if (!to || !to.includes("@")) {
            console.warn(`⚠️  Invalid recipient email: ${to}`);
            return false;
        }

        const mailOptions = {
            from: `"ESchool ERP" <${process.env.EMAIL_USER || "noreply@eschool.com"}>`,
            to,
            subject,
            text,
            html: htmlContent
        };

        if (!transporter) {
            console.log("--- 📧 MOCK EMAIL BROADCAST ---");
            console.log(`TO: ${to}`);
            console.log(`SUBJECT: ${subject}`);
            console.log("-------------------------------");
            return true;
        }

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
        return false;
    }
};

const sendSMS = async (phone, message) => {
    try {
        if (!phone) return false;

        // Placeholder for real SMS service
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = { sendEmail, sendSMS };