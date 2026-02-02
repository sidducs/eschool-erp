import { Link } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUniversity, FaArrowRight, FaCheckCircle } from "react-icons/fa";

function LandingPage() {
   return (
      <div className="font-sans bg-slate-50 min-h-screen flex flex-col">

         {/* --- NAVBAR --- */}
         <nav className="absolute top-0 left-0 w-full z-20 py-6">
            <div className="container mx-auto px-6 flex justify-between items-center">
               <div className="flex items-center gap-3 text-white">
                  <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg shadow-blue-900/50">
                     <FaUniversity size={24} />
                  </div>
                  <span className="font-bold text-xl tracking-tight">ESchool ERP</span>
               </div>
               <div className="flex items-center gap-4">
                  <Link to="/login" className="text-slate-200 hover:text-white font-semibold transition-colors">Log In</Link>
                  <Link to="/register" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-slate-100 transition-all transform hover:-translate-y-0.5">
                     Get Started
                  </Link>
               </div>
            </div>
         </nav>

         {/* --- HERO SECTION --- */}
         <section className="relative bg-slate-900 text-white pt-40 pb-48 overflow-hidden">
            {/* Background Gradients/Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
               <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl"></div>
               <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 text-center relative z-10">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-bold mb-6 animate-fadeIn">
                  <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
                  Advanced School Management System
               </div>

               <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                  Manage Your Institute <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                     Effortlessly & Efficiently
                  </span>
               </h1>

               <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Streamline administration, empower teachers, and engage students with our comprehensive, modern digital ecosystem.
               </p>

               <div className="flex justify-center gap-4">
                  <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70 transition-all transform hover:-translate-y-1 flex items-center">
                     Get Started Now <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

            {/* Shape Divider */}
            <div className="absolute bottom-[-1px] left-0 w-full h-24 bg-slate-50 [clip-path:polygon(0_100%,100%_100%,100%_0)] z-10"></div>
         </section>

         {/* --- FEATURES SECTION --- */}
         <section className="bg-slate-50 pb-20 flex-grow relative z-20">
            <div className="container mx-auto px-6 -mt-24">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* ADMIN CARD */}
                  <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                     <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FaUserShield size={32} />
                     </div>
                     <h4 className="text-xl font-bold text-slate-800 mb-2">Admin Control</h4>
                     <p className="text-slate-500 mb-6 text-sm leading-relaxed">Complete control over users, classes, fees, and system settings.</p>
                     <ul className="space-y-3">
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Manage Students & Teachers</li>
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Track Fee Payments</li>
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Generate Reports</li>
                     </ul>
                  </div>

                  {/* TEACHER CARD */}
                  <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                     <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FaChalkboardTeacher size={32} />
                     </div>
                     <h4 className="text-xl font-bold text-slate-800 mb-2">Teacher Portal</h4>
                     <p className="text-slate-500 mb-6 text-sm leading-relaxed">Effortless tools for grading, attendance, and scheduling.</p>
                     <ul className="space-y-3">
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Digital Attendance</li>
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Result & Grade Entry</li>
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Smart Timetables</li>
                     </ul>
                  </div>

                  {/* STUDENT CARD */}
                  <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                     <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FaUserGraduate size={32} />
                     </div>
                     <h4 className="text-xl font-bold text-slate-800 mb-2">Student Access</h4>
                     <p className="text-slate-500 mb-6 text-sm leading-relaxed">Real-time access to academic progress and digital resources.</p>
                     <ul className="space-y-3">
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />View Results & Grades</li>
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Download Fee Receipts</li>
                        <li className="flex items-center text-slate-600 text-sm font-medium"><FaCheckCircle className="text-green-500 mr-3" />Check Attendance</li>
                     </ul>
                  </div>

               </div>
            </div>
         </section>

         {/* --- FOOTER --- */}
         <footer className="bg-white py-8 border-t border-slate-200 mt-auto">
            <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
               <p className="font-medium mb-2">&copy; {new Date().getFullYear()} ESchool ERP. All rights reserved.</p>
               <p>Designed for Modern Education.</p>
            </div>
         </footer>

      </div>
   );
}

export default LandingPage;