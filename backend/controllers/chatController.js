const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "AI Service Unavailable (Missing API Key)" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "You are the AI Helpdesk Assistant for 'eSchool ERP'. Your role is to help students, teachers, and admins navigate the platform. \n\n" +
                "Key Features of ESchool ERP:\n" +
                "- **Admins**: Manage users, fees, classes, transport, library, and settings.\n" +
                "- **Teachers**: Mark attendance, create assignments, schedule exams, upload results.\n" +
                "- **Students**: View attendance, download assignments, take quizzes, pay fees, view results.\n\n" +
                "Answer questions concisely and helpfully. If you don't know something, ask for clarification. Be polite and professional."
        });

        // Sanitize history: ensure it starts with 'user' and roles alternate
        let sanitizedHistory = (history || []).map(msg => ({
            role: msg.role === 'client' ? 'user' : (msg.role === 'model' ? 'model' : 'user'), // Normalize roles
            parts: msg.parts || [{ text: msg.message || "" }] // Ensure parts structure
        }));

        // Remove any initial 'model' messages (Gemini requires 'user' to start)
        while (sanitizedHistory.length > 0 && sanitizedHistory[0].role !== 'user') {
            sanitizedHistory.shift();
        }

        const chat = model.startChat({
            history: sanitizedHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ reply: "I'm having trouble connecting to my brain right now. Please try again later." });
    }
};

const User = require("../models/User");

const Chat = require("../models/Chat"); // Import Chat model

const getContacts = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select("name role email admissionId classId profilePicture")
            .populate("classId", "name section");

        // Get unread counts & last message for each contact
        const contactsData = await Promise.all(users.map(async (contact) => {
            const lastMsg = await Chat.findOne({
                $or: [
                    { sender: req.user._id, receiver: contact._id },
                    { sender: contact._id, receiver: req.user._id }
                ]
            }).sort({ createdAt: -1 });

            const unreadCount = await Chat.countDocuments({
                sender: contact._id,
                receiver: req.user._id,
                read: false
            });

            return {
                ...contact.toObject(),
                unreadCount,
                lastMessage: lastMsg ? lastMsg.message : null,
                lastMessageTime: lastMsg ? lastMsg.createdAt : 0 // Default to 0 for no messages
            };
        }));

        // Sort: Most recent message first
        contactsData.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        res.json(contactsData);
    } catch (error) {
        console.error("Fetch Contacts Error:", error);
        res.status(500).json({ message: "Failed to load contacts" });
    }
};


const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        if (!message || !receiverId) {
            return res.status(400).json({ message: "Message and Receiver ID are required" });
        }

        const newMessage = await Chat.create({
            sender: req.user._id,
            receiver: receiverId,
            message
        });

        // Populate sender info to return to frontend immediately
        await newMessage.populate("sender", "name email");

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find messages between current user and userId
        const messages = await Chat.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
            ]
        })
            .sort({ createdAt: 1 }) // Oldest first
            .populate("sender", "name email");

        // Mark messages as read
        await Chat.updateMany(
            { sender: userId, receiver: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { askAI, getContacts, sendMessage, getMessages };
