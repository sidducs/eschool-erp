# 🎓 eSchool ERP: Detailed Project Handbook

Welcome to the official developer and user handbook for **eSchool ERP**, a modern, AI-powered School Management System built using the **MERN** stack. This document provides a comprehensive overview of the system architecture, features, and technical specifications.

---

## 🚀 1. Executive Summary
eSchool ERP is designed to be a lightweight yet powerful solution for educational institutions. It prioritizes automation, real-time communication, and data-driven insights to streamline administrative and academic workflows.

---

## 🛠️ 2. Technology Stack

### Frontend
- **React.js**: Core UI framework for a reactive user experience.
- **Tailwind CSS**: Utility-first styling for a premium, responsive design.
- **Socket.io-client**: Real-time communication for chat and notifications.
- **Chart.js / Recharts**: Dynamic data visualization for dashboards.

### Backend
- **Node.js & Express**: Scalable server-side infrastructure.
- **MongoDB & Mongoose**: Flexible NoSQL database for complex data relationships.
- **JSON Web Tokens (JWT)**: Secure, role-based authentication.
- **Nodemailer**: Automated email engine with professional HTML templates.
- **Socket.io**: Persistent websocket connections for real-time features.

### Infrastructure
- **Cloudinary**: High-performance storage for certificates, profile photos, and PDFs.
- **Vercel**: Optimized hosting for the frontend.
- **Render**: Reliable hosting for the backend services.

---

## 🏛️ 3. System Architecture & Roles

The system is divided into **6 distinct portals**, each tailored with specific permissions:

1.  **Super Admin**: Full system control, financial oversight, and staff management.
2.  **Teacher**: Grade entry, assignment management, and AI-powered quiz generation.
3.  **Student**: Academic tracking, fee payments, and interactive learning tools.
4.  **Parent**: Real-time monitoring of child attendance, results, and fees.
5.  **Accountant**: Specialized finance module for fee collection and payroll.
6.  **Librarian**: Digital and physical book tracking with SRN-based issuance.

---

## ✨ 4. Key Premium Features

### 🤖 AI-Powered Automation
- **Quiz Generator**: Teachers can instantly generate MCQs from text using AI.
- **Content Helper**: Admin can generate professional notification content.
- **Analytics**: Predictive insights for student performance and fee collection.

### 💰 Financial Management
- **Strict Fee Structures**: Admins can define global fee rules.
- **Automated Invoicing**: System generates detailed PDF receipts into Cloudinary.
- **Staff Payroll**: Automated payslip generation based on role and experience.

### 📢 Communication Engine
- **Real-time Chat**: Dedicated channels for Teachers, Parents, and Students.
- **HTML Email System**: Professional email notifications for onboarding, absent alerts, and fee reminders.
- **Heatmaps**: Visual attendance tracking for quick pattern recognition.

---

## 📋 5. Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account
- Cloudinary Account
- Gmail App Password (for SMTP)

### Environment Configuration
Create a `.env` file in both `backend/` and `frontend/` using the provided `.env.example` templates.

### Running Locally
```powershell
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

---

## 🔍 6. Technical Design Decisions
- **SRN System**: Every student is assigned a unique Serial Registration Number (SRN) upon approval for life-long tracking.
- **Hybrid Search**: The library combines regex-based fast search with AI-ready logic for book discovery.
- **Zero-Cost Scaling**: Leveraging Free-Tier services (Render, Vercel, Cloudinary, Atlas) to keep operating costs at zero for small institutions.

---

## 👨~🏼~🏽~🏾~🏿‍💻 7. Maintenance & Backups
- **Audit Logs**: Every critical action is logged with a timestamp and IP for security audits.
- **JSON Backup**: Admins can export the entire database in a single click for local redundancy.

---

*This handbook is maintained by the Antigravity AI Engineering team.*
