import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";

import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherEnterMarks from "./pages/TeacherEnterMarks";
import TeacherTimetable from "./pages/TeacherTimetable";

import StudentDashboard from "./pages/StudentDashboard";
import LibraryDashboard from "./pages/LibraryDashboard"; // Check this line

function AppWrapper() {
  const { token, user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={token && user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />}
      />

      {/* Teacher */}
      <Route path="/teacher" element={token && user?.role === "teacher" ? <TeacherDashboard /> : <Navigate to="/login" />} />
      <Route path="/teacher/attendance" element={token && user?.role === "teacher" ? <TeacherAttendance /> : <Navigate to="/login" />} />
      <Route path="/teacher/enter-marks" element={token && user?.role === "teacher" ? <TeacherEnterMarks /> : <Navigate to="/login" />} />
      <Route path="/teacher/timetable" element={token && user?.role === "teacher" ? <TeacherTimetable /> : <Navigate to="/login" />} />

      {/* Student & General */}
      <Route path="/student" element={token && user?.role === "student" ? <StudentDashboard /> : <Navigate to="/login" />} />
      <Route path="/library" element={<LibraryDashboard />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}