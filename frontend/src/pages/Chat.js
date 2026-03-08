import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { FaCommentDots, FaSearch, FaUserCircle, FaPaperPlane } from "react-icons/fa";

// Connect to backend socket
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");

function Chat() {
    const { user } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef(null);

    // Join room on mount
    useEffect(() => {
        if (user?._id) {
            socket.emit("join", user._id);
        }
    }, [user]);

    // Listen for messages
    useEffect(() => {
        socket.on("new_message", (message) => {
            const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
            const receiverId = typeof message.receiver === 'string' ? message.receiver : message.receiver._id;
            if (selectedUser && (senderId === selectedUser._id || receiverId === selectedUser._id)) {
                setMessages((prev) => [...prev, message]);
            }
            // Update contacts list last message (optional)
        });

        return () => socket.off("new_message");
    }, [selectedUser]);

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchContacts = async () => {
        try {
            const res = await api.get("/api/chat/contacts/list");
            setContacts(res.data);
        } catch (err) {
            console.error("Failed to fetch contacts", err);
        }
    };

    const fetchMessages = async (receiverId) => {
        try {
            const res = await api.get(`/api/chat/${receiverId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            await api.post("/api/chat/send", {
                receiverId: selectedUser._id,
                message: newMessage
            });
            // Socket will broadcast it back to us, but we can also update local state if backend doesn't broadcast to sender
            // But usually backend broadcasts to the room.
            setNewMessage("");
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [showChatArea, setShowChatArea] = useState(false);

    useEffect(() => {
        if (selectedUser) setShowChatArea(true);
    }, [selectedUser]);

    return (
        <div className="animate-fadeIn flex h-[calc(100vh-180px)] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
            {/* Sidebar - Contacts */}
            <div className={`${showChatArea ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-100 flex-col bg-slate-50/50`}>
                <div className="p-4 bg-white border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <FaCommentDots className="text-blue-600" /> Messages
                    </h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search people..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredContacts.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            No contacts found
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <button
                                key={contact._id}
                                onClick={() => {
                                    setSelectedUser(contact);
                                    setShowChatArea(true);
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedUser?._id === contact._id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1"
                                        : "hover:bg-white hover:shadow-md text-slate-600"
                                    }`}
                            >
                                <div className="relative">
                                    {contact.profilePicture ? (
                                        <img src={contact.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                    ) : (
                                        <FaUserCircle size={48} className={selectedUser?._id === contact._id ? "text-blue-200" : "text-slate-300"} />
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <h4 className="font-bold truncate text-sm">{contact.name}</h4>
                                    <p className={`text-xs truncate ${selectedUser?._id === contact._id ? "text-blue-100" : "text-slate-400"}`}>
                                        {contact.role} • {contact.email}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${showChatArea ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white overflow-hidden`}>
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <button 
                                onClick={() => setShowChatArea(false)}
                                className="md:hidden p-2 text-slate-400 hover:text-slate-600"
                            >
                                <FaCommentDots className="rotate-180" />
                            </button>
                            <div className="relative">
                                {selectedUser.profilePicture ? (
                                    <img src={selectedUser.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <FaUserCircle size={40} className="text-slate-300" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 leading-tight">{selectedUser.name}</h4>
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Online</span>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                        <FaCommentDots size={24} />
                                    </div>
                                    <p className="text-sm font-medium">No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                                    const isMe = senderId === user?._id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start animate-slideInLeft"}`}>
                                            <div className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe
                                                    ? "bg-slate-900 text-white rounded-br-none"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                                                }`}>
                                                <p className="leading-relaxed">{msg.message}</p>
                                                <span className={`text-[10px] mt-1 block h-3 ${isMe ? "text-slate-400" : "text-slate-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                            <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl items-center focus-within:ring-2 focus-within:ring-blue-500/20 transition-all border border-slate-200">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-slate-700 font-medium"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-90 flex items-center justify-center"
                                >
                                    <FaPaperPlane size={16} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-blue-600 animate-bounce-slow">
                            <FaCommentDots size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Instant Messenger</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            Choose a contact from the sidebar to start a real-time conversation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
