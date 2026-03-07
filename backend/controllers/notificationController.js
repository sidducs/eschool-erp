const User = require("../models/User");
const sendEmail = require("../utils/emailService");


const sendNotice = async (req, res) => {
    try {
        const { role, subject, message } = req.body; // role: 'student', 'teacher', 'parent', 'all'

        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and Message are required" });
        }

        let query = {};
        if (role && role !== "all") {
            // Map 'parent' role to 'student' users but target their parentEmail
            if (role === 'parent') {
                query = { role: 'student' };
            } else {
                query = { role };
            }
        }

        const users = await User.find(query).select("email parentEmail name");
        let emailCount = 0;

        // Send Emails (Asynchronous loop)
        const emailPromises = users.map(user => {
            let targetEmail = user.email;
            if (role === 'parent' && user.parentEmail) {
                targetEmail = user.parentEmail;
            }

            if (targetEmail) {
                emailCount++;
                return sendEmail(
                    targetEmail,
                    subject,
                    `Dear ${role === 'parent' ? 'Parent' : user.name},\n\n${message}\n\nRegards,\nESchool Administration`
                );
            }
        });

        await Promise.all(emailPromises);

        res.json({ message: `Notification queued for ${emailCount} recipients.` });

    } catch (error) {
        res.status(500).json({ message: "Failed to send notifications", error: error.message });
    }
};

module.exports = { sendNotice };
