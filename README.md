ESchool ERP - Full Stack MERN Application
A comprehensive School Management System (ERP) designed to streamline academic operations. The system provides dedicated portals for Administrators, Teachers, and Students with real-time data synchronization and responsive UI.

🚀 Key Features
Administrator Portal
User Management: Full CRUD operations for Students, Teachers, and Admins.

Academics: Create classes, assign sections, and enroll students.

Finance & Fees: Define fee structures, assign fees to students, and track payment history with PDF receipt downloads.

Notice Board: Broadcast announcements to specific roles or the entire school.

Master Timetable: Manage and update the school schedule.

Bulk Upload: Import student data via CSV files.

Student Portal
Personal Dashboard: Real-time overview of attendance percentage and exam status.

Academic Tools: View class timetables and examination schedules.

Finance: Check fee status and download payment receipts.

Library Hub: Integrated system to browse and manage book resources.

Teacher Portal (In Progress)
Attendance Tracking: Mark and manage student attendance.

Result Management: Upload and update exam scores.

🛠️ Tech Stack
Frontend: React.js, Bootstrap 5, Chart.js (for analytics), React Icons.

Backend: Node.js, Express.js.

Database: MongoDB (via Mongoose).

Authentication: JWT (JSON Web Tokens) with Context API for state management.

Other Tools: Axios (API calls), Multer (File uploads).

📂 Project Structure
Plaintext
ESchool-MERN/
├── backend/            # Express server, Models, Routes, Middleware
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI elements
│   │   ├── context/    # Auth and State management
│   │   ├── pages/      # Main Dashboard views
│   │   └── services/   # Axios API configurations
└── README.md


⚙️ Installation & Setup
1. Clone the repository
Bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd ESchool-MERN
2. Backend Setup
Bash
cd backend
npm install
Create a .env file in the backend folder:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Start the server:

Bash
npm start
3. Frontend Setup
Bash
cd ../frontend
npm install
npm start
📱 Responsiveness
The application features a Responsive Sidebar Navigation that:

Functions as a fixed sidebar on Desktop.

Transitions into a Mobile Drawer (Overlay) with a backdrop on smaller screens, ensuring usability when multitasking.

🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.
