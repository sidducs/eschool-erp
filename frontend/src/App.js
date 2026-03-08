import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Loader from "./components/Loader";
import LandingPage from "./pages/LandingPage";

import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherEnterMarks from "./pages/TeacherEnterMarks";
import TeacherTimetable from "./pages/TeacherTimetable";

import StudentLeaves from "./pages/StudentLeaves";
import AdminLeaves from "./pages/AdminLeaves";
import Chatbot from "./components/Chatbot";
import EmergencyBanner from "./components/EmergencyBanner"; // Added
import StudentDashboard from "./pages/StudentDashboard";
import LibraryDashboard from "./pages/LibraryDashboard";
import FeeReceiptView from "./pages/FeeReceiptView";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentProfileCompletion from "./pages/StudentProfileCompletion";
import ParentDashboard from "./pages/ParentDashboard";
import ParentRegister from "./pages/ParentRegister";

function AppWrapper() {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50">
      <EmergencyBanner />
      <Routes>
        <Route path="/" element={!token ? <LandingPage /> : (
          user ? <Navigate to={
            user.role === "admin" ? "/admin" :
              user.role === "teacher" ? "/teacher" :
                user.role === "accountant" ? "/accountant" :
                  user.role === "parent" ? "/parent/dashboard" :
                    "/student"
          } /> : <Loader />
        )} />

        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
        <Route path="/parent/register" element={!token ? <ParentRegister /> : <Navigate to="/" />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={token && user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route path="/accountant" element={token && user?.role === "accountant" ? <AccountantDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/leaves" element={token && user?.role === "admin" ? <AdminLeaves /> : <Navigate to="/login" />} />

        {/* Teacher */}
        <Route path="/teacher" element={token && user?.role === "teacher" ? <TeacherDashboard /> : <Navigate to="/login" />} />
        <Route path="/teacher/attendance" element={token && user?.role === "teacher" ? <TeacherAttendance /> : <Navigate to="/login" />} />
        <Route path="/teacher/enter-marks" element={token && user?.role === "teacher" ? <TeacherEnterMarks /> : <Navigate to="/login" />} />
        <Route path="/teacher/timetable" element={token && user?.role === "teacher" ? <TeacherTimetable /> : <Navigate to="/login" />} />
        <Route path="/teacher/leaves" element={token && user?.role === "teacher" ? <AdminLeaves /> : <Navigate to="/login" />} />

        {/* Parent */}
        <Route path="/parent/dashboard" element={token && user?.role === "parent" ? <ParentDashboard /> : <Navigate to="/login" />} />

        {/* Student & General */}
        <Route path="/student" element={token && user?.role === "student" ? (user.status === 'pending' ? <Navigate to="/student/complete-profile" /> : <StudentDashboard />) : <Navigate to="/login" />} />
        <Route path="/student/complete-profile" element={token && user?.role === "student" ? (user.status === 'active' ? <Navigate to="/student" /> : <StudentProfileCompletion />) : <Navigate to="/login" />} />
        <Route path="/student/leaves" element={token && (user?.role === "student" || user?.role === "parent") ? <StudentLeaves /> : <Navigate to="/login" />} />
        <Route path="/library" element={<LibraryDashboard />} />
        <Route path="/receipt/:id" element={<FeeReceiptView />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      {user && <Chatbot />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}