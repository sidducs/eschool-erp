const Inquiry = require("../models/Inquiry");
const sendEmail = require("../utils/emailService");
const { baseLayout } = require("../services/emailTemplates");

const sendInquiry = async (req, res) => {
    try {
        const { name, email, institution, message } = req.body;

        if (!name || !email || !institution || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newInquiry = new Inquiry({ name, email, institution, message });
        await newInquiry.save();

        // Notify Admin
        const adminEmail = "eschoolerpadm@gmail.com";
        const subject = `New Inquiry from ${name} (${institution})`;
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2563eb;">New Institutional Inquiry</h2>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Full Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Institution:</strong> ${institution}</p>
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
                <p>This inquiry has also been saved to the database for tracking.</p>
                <p>Regards,<br/>ESchool ERP System</p>
            </div>
        `;

        await sendEmail(adminEmail, subject, `New Inquiry: ${message}`, htmlContent);

        res.status(201).json({ message: "Inquiry sent successfully. We will contact you soon." });

    } catch (error) {
        console.error("Inquiry Error:", error);
        res.status(500).json({ message: "Failed to send inquiry", error: error.message });
    }
};

module.exports = { sendInquiry };
