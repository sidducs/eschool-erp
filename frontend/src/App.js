// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "./context/AuthContext";
// import LandingPage from "./pages/LandingPage";

// // Bootstrap Navbar
// import BootstrapNavbar from "./components/BootstrapNavbar";

// // Auth pages
// import Register from "./pages/Register";
// import Login from "./pages/Login";

// // Admin pages
// import AdminDashboard from "./pages/AdminDashboard";
// import AdminAttendance from "./pages/AdminAttendance";
// import AdminClasses from "./pages/AdminClasses";
// import AdminCreateClass from "./pages/AdminCreateClass";
// import AdminAssignStudent from "./pages/AdminAssignStudent";
// import AdminEditUser from "./pages/AdminEditUser";
// import AdminBulkUpload from "./pages/AdminBulkUpload";

// // Teacher pages
// import TeacherDashboard from "./pages/TeacherDashboard";
// import TeacherAttendance from "./pages/TeacherAttendance";

// // Student pages
// import StudentDashboard from "./pages/StudentDashboard";
// import StudentAttendance from "./pages/StudentAttendance";

// import AdminCreateExam from "./pages/AdminCreateExam";
// import TeacherEnterMarks from "./pages/TeacherEnterMarks";
// import StudentResults from "./pages/StudentResults";
// import AdminAssignFee from "./pages/AdminAssignFee";
// import AdminStudentFees from "./pages/AdminStudentFees";
// import AdminCreateFeeStructure from "./pages/AdminCreateFeeStructure";

// function App() {
//   const { token, user, loading } = useContext(AuthContext);

//   if (loading) {
//     return <p style={{ padding: "20px" }}>Loading...</p>;
//   }

//   return (
//     <BrowserRouter>
//       {/* ✅ SINGLE NAVBAR (BOOTSTRAP) */}
//       {token && <BootstrapNavbar />}

//       <Routes>
//         {/* Default */}
//         {/* <Route path="/" element={<Navigate to="/login" />} /> */}

//         {/* Auth */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* Admin */}
//         <Route
//           path="/admin"
//           element={
//             token && user?.role === "admin"
//               ? <AdminDashboard />
//               : <Navigate to="/login" />
//           }
//         />
//         <Route
//   path="/admin/create-fee"
//   element={
//     token && user?.role === "admin"
//       ? <AdminCreateFeeStructure />
//       : <Navigate to="/login" />
//   }
// />

//         <Route
//   path="/admin/create-exam"
//   element={
//     token && user?.role === "admin"
//       ? <AdminCreateExam />
//       : <Navigate to="/login" />
//   }
// />
// <Route path="/" element={<LandingPage />} />

// <Route path="/admin/assign-fee" element={<AdminAssignFee />} />
// <Route
//   path="/admin/student-fees"
//   element={
//     token && user?.role === "admin"
//       ? <AdminStudentFees />
//       : <Navigate to="/login" />
//   }
// />
// <Route
//   path="/teacher/enter-marks"
//   element={
//     token && user?.role === "teacher"
//       ? <TeacherEnterMarks />
//       : <Navigate to="/login" />
//   }
// />
// <Route
//   path="/student/results"
//   element={
//     token && user?.role === "student"
//       ? <StudentResults />
//       : <Navigate to="/login" />
//   }
// />


//         <Route
//           path="/admin/attendance"
//           element={
//             token && user?.role === "admin"
//               ? <AdminAttendance />
//               : <Navigate to="/login" />
//           }
//         />

//         <Route
//           path="/admin/classes"
//           element={
//             token && user?.role === "admin"
//               ? <AdminClasses />
//               : <Navigate to="/login" />
//           }
//         />

//         <Route
//           path="/admin/create-class"
//           element={
//             token && user?.role === "admin"
//               ? <AdminCreateClass />
//               : <Navigate to="/login" />
//           }
//         />

//         <Route
//           path="/admin/assign-student"
//           element={
//             token && user?.role === "admin"
//               ? <AdminAssignStudent />
//               : <Navigate to="/login" />
//           }
//         />

//         <Route
//           path="/admin/edit-user/:id"
//           element={
//             token && user?.role === "admin"
//               ? <AdminEditUser />
//               : <Navigate to="/login" />
//           }
//         />

//         <Route
//           path="/admin/bulk-upload"
//           element={
//             token && user?.role === "admin"
//               ? <AdminBulkUpload />
//               : <Navigate to="/login" />
//           }
//         />

//         {/* Teacher */}
//         <Route
//           path="/teacher"
//           element={
//             token && user?.role === "teacher"
//               ? <TeacherDashboard />
//               : <Navigate to="/login" />
//           }
//         />

//         <Route
//           path="/teacher/attendance"
//           element={
//             token && user?.role === "teacher"
//               ? <TeacherAttendance />
//               : <Navigate to="/login" />
//           }
//         />

//         {/* Student */}
//         <Route
//           path="/student"
//           element={
//             token && user?.role === "student"
//               ? <StudentDashboard />
//               : <Navigate to="/login" />
//           }
//         />

//         <Route
//           path="/student/attendance"
//           element={
//             token && user?.role === "student"
//               ? <StudentAttendance />
//               : <Navigate to="/login" />
//           }
//         />

//         {/* Catch-all */}
//         <Route path="*" element={<Navigate to="/login" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";

// Removed BootstrapNavbar import to fix warning
// import BootstrapNavbar from "./components/BootstrapNavbar"; 

import Register from "./pages/Register";
import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
// import AdminAttendance from "./pages/AdminAttendance";
// import AdminClasses from "./pages/AdminClasses";
// import AdminCreateClass from "./pages/AdminCreateClass";
// import AdminAssignStudent from "./pages/AdminAssignStudent";
// import AdminEditUser from "./pages/AdminEditUser";
// import AdminBulkUpload from "./pages/AdminBulkUpload";
// import AdminCreateExam from "./pages/AdminCreateExam";
// import AdminAssignFee from "./pages/AdminAssignFee";
// import AdminStudentFees from "./pages/AdminStudentFees";
// import AdminCreateFeeStructure from "./pages/AdminCreateFeeStructure";
// import AdminTimetable from "./pages/AdminTimetable";

import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherEnterMarks from "./pages/TeacherEnterMarks";
import TeacherTimetable from "./pages/TeacherTimetable";

import StudentDashboard from "./pages/StudentDashboard";
// import StudentAttendance from "./pages/StudentAttendance";
// import StudentResults from "./pages/StudentResults";
// import StudentTimetable from "./pages/StudentTimetable";
// import StudentFees from "./pages/StudentFees";

function AppWrapper() {
  const { token, user, loading } = useContext(AuthContext);
  // const location = useLocation(); // Removed unused location hook

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  // Removed unused hideNavbar logic

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            token && user?.role === "admin"
              ? <AdminDashboard />
              : <Navigate to="/login" />
          }
        />
        {/* <Route path="/admin/edit-user/:id" element={token && user?.role === "admin" ? <AdminEditUser /> : <Navigate to="/login" />} />
        <Route path="/admin/create-fee" element={token && user?.role === "admin" ? <AdminCreateFeeStructure /> : <Navigate to="/login" />} />
        <Route path="/admin/create-exam" element={token && user?.role === "admin" ? <AdminCreateExam /> : <Navigate to="/login" />} />
        <Route path="/admin/assign-fee" element={token && user?.role === "admin" ? <AdminAssignFee /> : <Navigate to="/login" />} />
        <Route path="/admin/student-fees" element={token && user?.role === "admin" ? <AdminStudentFees /> : <Navigate to="/login" />} />
        <Route path="/admin/attendance" element={token && user?.role === "admin" ? <AdminAttendance /> : <Navigate to="/login" />} />
        <Route path="/admin/classes" element={token && user?.role === "admin" ? <AdminClasses /> : <Navigate to="/login" />} />
        <Route path="/admin/create-class" element={token && user?.role === "admin" ? <AdminCreateClass /> : <Navigate to="/login" />} />
        <Route path="/admin/assign-student" element={token && user?.role === "admin" ? <AdminAssignStudent /> : <Navigate to="/login" />} />
        <Route path="/admin/bulk-upload" element={token && user?.role === "admin" ? <AdminBulkUpload /> : <Navigate to="/login" />} />
        <Route path="/admin/timetable" element={token && user?.role === "admin" ? <AdminTimetable /> : <Navigate to="/login" />} />
         */}

        {/* Teacher */}
        <Route path="/teacher" element={token && user?.role === "teacher" ? <TeacherDashboard /> : <Navigate to="/login" />} />
        <Route path="/teacher/attendance" element={token && user?.role === "teacher" ? <TeacherAttendance /> : <Navigate to="/login" />} />
        <Route path="/teacher/enter-marks" element={token && user?.role === "teacher" ? <TeacherEnterMarks /> : <Navigate to="/login" />} />
        <Route path="/teacher/timetable" element={token && user?.role === "teacher" ? <TeacherTimetable /> : <Navigate to="/login" />} />

        {/* Student */}
        <Route path="/student" element={token && user?.role === "student" ? <StudentDashboard /> : <Navigate to="/login" />} />
        {/* <Route path="/student/attendance" element={token && user?.role === "student" ? <StudentAttendance /> : <Navigate to="/login" />} />
        <Route path="/student/results" element={token && user?.role === "student" ? <StudentResults /> : <Navigate to="/login" />} />
        <Route path="/student/timetable" element={token && user?.role === "student" ? <StudentTimetable /> : <Navigate to="/login" />} />
        <Route path="/student/fees" element={token && user?.role === "student" ? <StudentFees /> : <Navigate to="/login" />} /> */}

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}