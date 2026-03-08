const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection once
transporter.verify((error) => {
    if (error) {
        console.error("Email service initialization failed");
    }
});

const sendEmail = async (to, subject, text, htmlContent = null) => {
    try {
        if (!to || !to.includes("@")) return false;

        const mailOptions = {
            from: `"ESchool ERP" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        };

        if (htmlContent) {
            mailOptions.html = htmlContent;
        }

        await transporter.sendMail(mailOptions);

        return true;
    } catch (error) {
        console.error("Email sending failed:", error.message);
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