# 🎓 ESchool - Modern School Management System (ERP)

A full-stack **MERN** (MongoDB, Express, React, Node.js) School ERP application designed to digitize generic school operations. It features a robust **Role-Based Access Control (RBAC)** system for Admins, Teachers, and Students, along with modern features like Hybrid Registration, AI-powered Remarks, and Dynamic Timetables.

---

## 🚀 Key Features

### 🛡️ Admin Module (Power User)
- **Dashboard**: Real-time stats, financial overview, and attendance charts.
- **User Management**: Manage Students and Teachers.
- **Approvals**: Review "Pending" student registrations and **Auto-Generate SRN**.
- **Timetable**: **Visual Grid View** with smart conflict detection (prevents double-booking).
- **Fees**: Create fee structures, track payments, and generate **PDF Receipts**.
- **Security**: Manually reset passwords for any user using "Security Override".

### 👨‍🏫 Teacher Module
- **Attendance**: Mark daily attendance easily.
- **Results & AI**: Enter marks and generate **AI-powered performance remarks** for students.
- **Schedule**: View personal weekly timetable.
- **Profile**: Manage personal details and profile photo.

### 👨‍🎓 Student Module
- **Hybrid Registration**: Self-register online (starts as `Pending`) -> Complete Profile -> Admin Approval.
- **Dashboard**: View Attendance %, Exam Results, and Notices.
- **Fee Receipts**: Download fee payment receipts directly.
- **Library**: Search books and view borrowed items.
- **My Profile**: Update photo, parents' info, and change password.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Context API.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose Schema).
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for password hashing.
- **Tools**: Multer (File Upload), Recharts (Analytics), Axios.

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sidducs/eschool-erp.git
cd eschool-erp
```

### 2. Backend Setup
```bash
cd backend
npm install
```
**Create a `.env` file in the `backend` folder:**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
**Run the Server:**
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

The app should now be running at `http://localhost:3000`!

---



## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
