import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUniversity,
  FaArrowRight, FaCheckCircle, FaBars, FaTimes, FaEnvelope,
  FaCalculator, FaUserFriends, FaRobot, FaBell, FaFileAlt,
  FaCalendarAlt, FaBus, FaBook, FaChartBar, FaShieldAlt,
  FaStar, FaMoon, FaSun, FaGraduationCap, FaIdCard,
  FaMoneyBillWave, FaClipboardList, FaClock, FaLock
} from "react-icons/fa";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Counter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: "",
    email: "",
    institution: "",
    message: ""
  });

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/inquiries/send", inquiryData);
      addToast(res.data.message, "success");
      setInquiryData({ name: "", email: "", institution: "", message: "" });
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to send inquiry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [heroRef, heroIn] = useInView(0.1);
  const [statsRef, statsIn] = useInView();
  const [featRef, featIn] = useInView();
  const [rolesRef, rolesIn] = useInView();
  const [aiRef, aiIn] = useInView();
  const [ctaRef, ctaIn] = useInView();

  const roles = {
    admin: {
      icon: <FaUserShield size={28} />,
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
      label: "Admin",
      headline: "Total Command Center",
      desc: "Run your entire institution from one intelligent dashboard. Manage admissions, fees, staff, and reports with precision and speed.",
      features: [
        { icon: <FaUserFriends />, label: "User & Admission Management" },
        { icon: <FaMoneyBillWave />, label: "Fee Structure & Collection" },
        { icon: <FaClipboardList />, label: "Bulk CSV Upload" },
        { icon: <FaCalendarAlt />, label: "Exam & Timetable Scheduling" },
        { icon: <FaFileAlt />, label: "Report & Certificate Generation" },
        { icon: <FaBell />, label: "Mass Notification System" },
      ]
    },
    teacher: {
      icon: <FaChalkboardTeacher size={28} />,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
      label: "Teacher",
      headline: "Smart Teaching Tools",
      desc: "Mark attendance, enter marks, create assignments and quizzes — all from one clean interface built for educators.",
      features: [
        { icon: <FaClock />, label: "Period-wise Attendance" },
        { icon: <FaChartBar />, label: "AI-powered Mark Entry" },
        { icon: <FaBook />, label: "Assignment Management" },
        { icon: <FaStar />, label: "Quiz Creator" },
        { icon: <FaCalendarAlt />, label: "Smart Timetable View" },
        { icon: <FaEnvelope />, label: "Doubt Forum Replies" },
      ]
    },
    student: {
      icon: <FaUserGraduate size={28} />,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      label: "Student",
      headline: "Your Academic Hub",
      desc: "Access results, timetables, fee receipts, library books, and AI-powered study tools — all in one place.",
      features: [
        { icon: <FaChartBar />, label: "Results & Report Card PDF" },
        { icon: <FaMoneyBillWave />, label: "Fee Status & Receipt" },
        { icon: <FaIdCard />, label: "Digital Student ID Card" },
        { icon: <FaBook />, label: "Library & E-resources" },
        { icon: <FaBus />, label: "Transport Route Info" },
        { icon: <FaRobot />, label: "AI Chatbot Assistant" },
      ]
    },
    parent: {
      icon: <FaUserFriends size={28} />,
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-200",
      label: "Parent",
      headline: "Stay Connected",
      desc: "Monitor your child's attendance, results, fee status and timetable in real time. Get instant absence alerts via email.",
      features: [
        { icon: <FaCheckCircle />, label: "Real-time Attendance Alerts" },
        { icon: <FaChartBar />, label: "Academic Progress View" },
        { icon: <FaMoneyBillWave />, label: "Fee Status Tracking" },
        { icon: <FaCalendarAlt />, label: "Timetable Access" },
        { icon: <FaEnvelope />, label: "HTML Email Notifications" },
        { icon: <FaShieldAlt />, label: "Secure Child Linking via SRN" },
      ]
    },
    accountant: {
      icon: <FaCalculator size={28} />,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      label: "Accountant",
      headline: "Financial Intelligence",
      desc: "Track collections, manage payroll, log expenses and generate financial reports with complete audit trails.",
      features: [
        { icon: <FaMoneyBillWave />, label: "Fee Collection Dashboard" },
        { icon: <FaFileAlt />, label: "Payroll Processing" },
        { icon: <FaChartBar />, label: "Expense Management" },
        { icon: <FaClipboardList />, label: "Financial Reports" },
        { icon: <FaCheckCircle />, label: "Payment History" },
        { icon: <FaShieldAlt />, label: "Full Audit Trail" },
      ]
    }
  };

  const aiFeatures = [
    { icon: <FaRobot size={24} />, title: "AI Chatbot", desc: "24/7 intelligent assistant answers student and parent queries instantly using Gemini AI." },
    { icon: <FaCalendarAlt size={24} />, title: "Smart Timetable", desc: "AI generates conflict-free timetables considering teacher availability and room capacity." },
    { icon: <FaFileAlt size={24} />, title: "Auto Remarks", desc: "AI writes personalised performance remarks for every student on their report card." },
    { icon: <FaBell size={24} />, title: "Automated Emails", desc: "HTML email alerts for absences, fee dues, exam reminders and approvals — sent automatically." },
    { icon: <FaChartBar size={24} />, title: "Grade Prediction", desc: "AI analyses performance trends and flags at-risk students before exams." },
    { icon: <FaClipboardList size={24} />, title: "Quiz Generator", desc: "Teachers generate MCQ quizzes from topics in seconds using AI assistance." },
  ];

  const modules = [
    { icon: <FaUserShield />, label: "Admissions" },
    { icon: <FaMoneyBillWave />, label: "Fee Management" },
    { icon: <FaCheckCircle />, label: "Attendance" },
    { icon: <FaBook />, label: "Library" },
    { icon: <FaBus />, label: "Transport" },
    { icon: <FaCalendarAlt />, label: "Timetable" },
    { icon: <FaFileAlt />, label: "Exams & Results" },
    { icon: <FaClipboardList />, label: "Assignments" },
    { icon: <FaStar />, label: "Quizzes" },
    { icon: <FaEnvelope />, label: "Notifications" },
    { icon: <FaRobot />, label: "AI Chatbot" },
    { icon: <FaIdCard />, label: "ID Cards" },
    { icon: <FaChartBar />, label: "Analytics" },
    { icon: <FaCalculator />, label: "Payroll" },
    { icon: <FaUserFriends />, label: "Doubt Forum" },
    { icon: <FaLock />, label: "Role Security" },
  ];

  const r = roles[activeTab];

  return (
    <div className="font-sans bg-white min-h-screen" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/95 backdrop-blur-md shadow-xl shadow-black/20" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/eschool-logo-full.png" alt="eSchool ERP" className="h-12 w-auto object-contain transition-transform hover:scale-105" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#solutions" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Solutions</a>
            <a href="#features" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#roles" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Roles</a>
            <a href="#ai" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">AI Tools</a>
            <a href="#contact" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-semibold transition-colors px-4 py-2">Log In</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-0.5 transform">
              Get Started →
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-700 px-6 py-6 flex flex-col gap-5">
            <a href="#solutions" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium text-base">Solutions</a>
            <a href="#features" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium text-base">Features</a>
            <a href="#roles" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium text-base">Roles</a>
            <a href="#ai" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium text-base">AI Tools</a>
            <a href="#contact" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium text-base">Contact</a>
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-700">
              <Link to="/login" className="text-center text-white font-semibold py-3 border border-slate-600 rounded-xl">Log In</Link>
              <Link to="/register" className="text-center bg-blue-600 text-white font-bold py-3 rounded-xl">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      <section className="relative bg-slate-900 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-indigo-700/10 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}></div>
        </div>

        <div ref={heroRef} className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            <div className={`flex-1 text-center lg:text-left transition-all duration-1000 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                AI-Powered School Management
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                The Modern ERP<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Built for Schools
                </span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Manage admissions, fees, attendance, exams, library, transport and more — with AI-powered tools that save hours every day.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-900/40 transition-all hover:-translate-y-1 transform flex items-center justify-center gap-2 text-sm">
                  Start Free Today <FaArrowRight />
                </Link>
                <Link to="/login" className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all text-sm flex items-center justify-center">
                  Login to Dashboard
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start">
                {[["5", "User Roles"], ["16+", "Modules"], ["AI", "Powered"], ["Free", "Hosting"]].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-black text-white">{val}</div>
                    <div className="text-xs text-slate-500 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex-1 w-full max-w-lg transition-all duration-1000 delay-300 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                  <div className="flex-1 bg-slate-700 rounded-md h-6 ml-2 flex items-center px-3">
                    <span className="text-slate-400 text-xs">eschool-erp.vercel.app</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[["Total Students", "248", "text-blue-400"], ["Fee Collected", "₹1.2L", "text-emerald-400"], ["Attendance", "94%", "text-violet-400"], ["Active Staff", "32", "text-amber-400"]].map(([label, val, color]) => (
                    <div key={label} className="bg-slate-700/50 rounded-xl p-4">
                      <div className={`text-xl font-black ${color}`}>{val}</div>
                      <div className="text-slate-400 text-xs mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 mb-3">
                  <div className="text-slate-400 text-xs mb-3 font-medium">Recent Activity</div>
                  {[
                    ["Ravi Kumar marked absent", "2m ago", "text-red-400"],
                    ["Fee assigned to Class 10A", "15m ago", "text-blue-400"],
                    ["New admission: Priya S.", "1h ago", "text-emerald-400"],
                  ].map(([msg, time, color]) => (
                    <div key={msg} className="flex justify-between items-center py-1.5 border-b border-slate-600/50 last:border-0">
                      <span className={`text-xs ${color}`}>{msg}</span>
                      <span className="text-slate-500 text-xs">{time}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-blue-600/20 border border-blue-500/20 rounded-lg p-3 text-center">
                    <div className="text-blue-400 text-xs font-bold">AI Chatbot</div>
                    <div className="text-slate-500 text-xs">Online</div>
                  </div>
                  <div className="flex-1 bg-emerald-600/20 border border-emerald-500/20 rounded-lg p-3 text-center">
                    <div className="text-emerald-400 text-xs font-bold">3 Leaves</div>
                    <div className="text-slate-500 text-xs">Pending</div>
                  </div>
                  <div className="flex-1 bg-violet-600/20 border border-violet-500/20 rounded-lg p-3 text-center">
                    <div className="text-violet-400 text-xs font-bold">2 Exams</div>
                    <div className="text-slate-500 text-xs">Tomorrow</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg viewBox="0 0 1440 60" className="w-full fill-white" preserveAspectRatio="none">
            <path d="M0,60 L1440,60 L1440,0 Q720,60 0,0 Z" />
          </svg>
        </div>
      </section>

      <section ref={statsRef} className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 ${statsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { val: 16, suffix: "+", label: "ERP Modules", color: "text-blue-600" },
              { val: 5, suffix: "", label: "User Roles", color: "text-emerald-600" },
              { val: 100, suffix: "%", label: "Free Hosting", color: "text-violet-600" },
              { val: 8, suffix: "+", label: "AI Features", color: "text-amber-600" },
            ].map(({ val, suffix, label, color }) => (
              <div key={label} className="text-center">
                <div className={`text-4xl sm:text-5xl font-black ${color} mb-2`}>
                  <Counter target={val} suffix={suffix} />
                </div>
                <div className="text-slate-500 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Our Solutions</span>
              <h2 className="text-4xl font-black text-slate-900 mt-6 mb-6 leading-tight">Digital Transformation for <span className="text-blue-600">Modern Education</span></h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                We provide a comprehensive ecosystem that bridges the gap between administrators, teachers, parents, and students. Our platform is designed to handle the complexity of modern school management with ease.
              </p>
              <div className="space-y-4">
                {[
                  { t: "Automated Governance", d: "Digital trails for every action, ensuring transparency and accountability." },
                  { t: "Data-Driven Decisions", d: "Real-time analytics and AI insights to monitor institutional health." },
                  { t: "Seamless Communication", d: "Multi-channel alerts across email and internal messaging systems." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                      <FaCheckCircle size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.t}</h4>
                      <p className="text-slate-500 text-sm mt-1">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-1 shadow-2xl overflow-hidden transform lg:rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="bg-slate-950 rounded-[1.8rem] p-6">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <FaChartBar className="text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Academic Performance</h4>
                        <p className="text-slate-500 text-xs">Live Analytics</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {[
                        { l: "Attendance rate", v: "98.4%", w: "w-[98%]", c: "bg-emerald-500" },
                        { l: "Fee Collection", v: "₹4.2M", w: "w-[85%]", c: "bg-blue-500" },
                        { l: "Student Success", v: "92%", w: "w-[92%]", c: "bg-violet-500" }
                      ].map((bar, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                            <span>{bar.l}</span>
                            <span>{bar.v}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className={`${bar.c} h-full ${bar.w} rounded-full`}></div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                   <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                      <FaStar />
                   </div>
                   <div>
                      <div className="text-xl font-black text-slate-800">4.9/5</div>
                      <div className="text-xs text-slate-500 font-medium">User Rating</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="bg-slate-950 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Why eSchool ERP?</span>
            <h2 className="text-4xl font-black text-white mt-4">Built for the Future of Learning</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FaShieldAlt />, title: "Bank-Grade Security", desc: "Your data is encrypted and protected with industry-standard protocols and role-based access control." },
              { icon: <FaClock />, title: "Zero Downtime", desc: "Hosted on cloud infrastructure ensuring your school stays online 24/7 without interruptions." },
              { icon: <FaArrowRight className="rotate-[-45deg]" />, title: "Scalability", desc: "Whether you have 100 students or 10,000, our system adapts to your institutional needs seamlessly." }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors">
                <div className="text-indigo-400 text-3xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Trusted Technology Partners</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             {["MongoDB", "Vercel", "DigitalOcean", "Google AI", "AWS"].map(brand => (
               <span key={brand} className="text-2xl font-black text-slate-300 italic transform hover:scale-110 transition-transform cursor-default">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      <section id="features" ref={featRef} className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-14 transition-all duration-700 ${featIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Core Features</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">Everything Your School Needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">A complete institutional management platform — from the first admission to the final report card.</p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${featIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { icon: <FaMoneyBillWave size={22} />, title: "Fee Management", desc: "Create fee structures, assign to students, collect payments and generate PDF receipts. Auto reminders 3 days before due date.", color: "bg-blue-50 text-blue-600" },
              { icon: <FaCheckCircle size={22} />, title: "Smart Attendance", desc: "Period-wise attendance marking with duplicate prevention. Parents get instant HTML email alerts when child is absent.", color: "bg-emerald-50 text-emerald-600" },
              { icon: <FaFileAlt size={22} />, title: "Exams & Results", desc: "Schedule exams, enter marks, auto-calculate grades and AI remarks. Generate downloadable report card PDFs.", color: "bg-violet-50 text-violet-600" },
              { icon: <FaBook size={22} />, title: "Library System", desc: "Manage books, issue and return tracking, fine calculation for overdue books. Book cover images from Open Library.", color: "bg-amber-50 text-amber-600" },
              { icon: <FaBus size={22} />, title: "Transport", desc: "Define routes, stops and vehicle assignments. Students can view their assigned route and timing.", color: "bg-rose-50 text-rose-600" },
              { icon: <FaBell size={22} />, title: "Notifications", desc: "Send mass emails to roles, individual users or groups. Beautiful HTML templates for every event type.", color: "bg-indigo-50 text-indigo-600" },
              { icon: <FaUserFriends size={22} />, title: "Doubt Forum", desc: "Students post doubts, teachers respond. Threaded discussion for every subject.", color: "bg-teal-50 text-teal-600" },
              { icon: <FaIdCard size={22} />, title: "Digital ID Card", desc: "Auto-generated student ID cards with SRN, photo, class and blood group. Printable from the browser.", color: "bg-orange-50 text-orange-600" },
              { icon: <FaLock size={22} />, title: "Password Recovery", desc: "Secure forgot-password flow with time-limited reset tokens. No third-party auth required.", color: "bg-slate-100 text-slate-600" },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
                <h3 className="text-slate-900 font-bold text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" ref={rolesRef} className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-12 transition-all duration-700 ${rolesIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Role-Based Access</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">Built for Every Stakeholder</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">5 distinct roles, each with their own dashboard, permissions, and tools.</p>
          </div>

          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
            {Object.entries(roles).map(([key, role]) => (
              <button
                 key={key}
                 onClick={() => setActiveTab(key)}
                 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === key
                     ? `bg-gradient-to-r ${role.color} text-white shadow-lg`
                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                   }`}
              >
                {role.icon} {role.label}
              </button>
            ))}
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center transition-all duration-500 ${rolesIn ? "opacity-100" : "opacity-0"}`}>
            <div>
              <div className={`inline-flex items-center gap-3 ${r.text} ${r.bg} px-4 py-2 rounded-xl font-bold text-sm mb-6 border ${r.border}`}>
                {r.icon} {r.label} Portal
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">{r.headline}</h3>
              <p className="text-slate-500 text-base leading-relaxed mb-8">{r.desc}</p>
              <Link to="/register" className={`inline-flex items-center gap-2 bg-gradient-to-r ${r.color} text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-sm`}>
                Get Started as {r.label} <FaArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {r.features.map(({ icon, label }) => (
                <div key={label} className={`flex items-center gap-3 p-4 ${r.bg} border ${r.border} rounded-xl`}>
                  <span className={`${r.text} text-lg`}>{icon}</span>
                  <span className="text-slate-700 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ai" ref={aiRef} className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-14 transition-all duration-700 ${aiIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Powered by Gemini AI</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-4">AI That Actually Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">Not just a chatbot — AI woven throughout every part of the ERP to save time and improve decisions.</p>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-all duration-700 delay-200 ${aiIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {aiFeatures.map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/40 hover:bg-slate-800 transition-all group">
                <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Complete System</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">16+ Integrated Modules</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm">Every module talks to every other. One system, zero silos.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {modules.map(({ icon, label }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all group">
                <span className="text-blue-600 text-lg group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-slate-700 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-slate-900 rounded-[3rem] overflow-hidden p-10 md:p-20 relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                  <div>
                     <h2 className="text-4xl font-black text-white mb-6">Let's Discuss Your <span className="text-blue-400">School's Future</span></h2>
                     <p className="text-slate-400 mb-8">Have questions? Our experts are ready to help you implement eSchool ERP at your institution.</p>
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 text-white">
                           <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                              <FaEnvelope />
                           </div>
                           <div>
                              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Email Us</div>
                              <div className="font-bold">eschoolerpadm@gmail.com
</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-white">
                           <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                              <FaUniversity />
                           </div>
                           <div>
                              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Visit Us</div>
                              <div className="font-bold">Bangalore, Karnataka, India</div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                     <form onSubmit={handleInquirySubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <input 
                             type="text" 
                             placeholder="Full Name" 
                             className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500" 
                             value={inquiryData.name}
                             onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                             required
                           />
                           <input 
                             type="email" 
                             placeholder="Email Address" 
                             className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500" 
                             value={inquiryData.email}
                             onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                             required
                           />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Institution Name" 
                          className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500" 
                          value={inquiryData.institution}
                          onChange={(e) => setInquiryData({...inquiryData, institution: e.target.value})}
                          required
                        />
                        <textarea 
                          placeholder="Tell us about your needs..." 
                          rows="4" 
                          className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500"
                          value={inquiryData.message}
                          onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                          required
                        ></textarea>
                        <button 
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-900/40 transition-all disabled:opacity-50"
                        >
                          {loading ? "Sending..." : "Send Inquiry"}
                        </button>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section ref={ctaRef} className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className={`max-w-3xl mx-auto px-4 sm:px-6 text-center transition-all duration-700 ${ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <FaGraduationCap size={48} className="text-blue-200 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">Ready to Modernise Your School?</h2>
          <p className="text-blue-100 text-base sm:text-lg mb-10 leading-relaxed">
            eSchool ERP is free to deploy, open source, and built with the latest web technology. Get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-700 font-black px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-sm flex items-center justify-center gap-2">
              Create Free Account <FaArrowRight />
            </Link>
            <Link to="/login" className="border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-xl transition-all text-sm flex items-center justify-center">
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div>
              <div className="flex items-center mb-4">
                <img src="/eschool-logo-full.png" alt="eSchool ERP" className="h-14 w-auto object-contain" />
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">A modern, AI-powered School ERP built with the MERN stack. Free, open-source, and production-ready.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <div className="text-white font-bold mb-4">Platform</div>
                <div className="flex flex-col gap-2.5">
                  <a href="#features" className="text-slate-500 hover:text-slate-300 transition-colors">Features</a>
                  <a href="#roles" className="text-slate-500 hover:text-slate-300 transition-colors">Roles</a>
                  <a href="#ai" className="text-slate-500 hover:text-slate-300 transition-colors">AI Tools</a>
                  <a href="#modules" className="text-slate-500 hover:text-slate-300 transition-colors">Modules</a>
                </div>
              </div>
              <div>
                <div className="text-white font-bold mb-4">Access</div>
                <div className="flex flex-col gap-2.5">
                  <Link to="/login" className="text-slate-500 hover:text-slate-300 transition-colors">Login</Link>
                  <Link to="/register" className="text-slate-500 hover:text-slate-300 transition-colors">Register</Link>
                  <Link to="/forgot-password" className="text-slate-500 hover:text-slate-300 transition-colors">Forgot Password</Link>
                </div>
              </div>
              <div>
                <div className="text-white font-bold mb-4">Tech Stack</div>
                <div className="flex flex-col gap-2.5">
                  {["MongoDB", "Express.js", "React", "Node.js", "Tailwind CSS", "Gemini AI"].map(t => (
                    <span key={t} className="text-slate-500 text-xs">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-600 text-xs">
            <p>© {new Date().getFullYear()} eSchool ERP. Built with ❤️ by Siddu.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}