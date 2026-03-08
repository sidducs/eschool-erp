/**
 * ESchool ERP Email Templates
 * Design: Responsive HTML, Max 600px, Professional School UI
 */

const baseLayout = (headerContent, bodyContent, headerBg = "#1e293b") => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8fafc; color: #374151; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; }
        .header { background-color: ${headerBg}; padding: 32px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .body { padding: 40px 32px; line-height: 1.6; }
        .info-box { background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .info-item { margin: 8px 0; font-size: 14px; }
        .info-label { font-weight: bold; color: #64748b; margin-right: 8px; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 24px; }
        .footer { background-color: #f8fafc; padding: 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e2e8f0; }
        .alert-box { padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid transparent; }
        .alert-red { background-color: #fee2e2; border-color: #fecaca; color: #991b1b; }
        .alert-green { background-color: #dcfce7; border-color: #bbf7d0; color: #166534; }
        .alert-yellow { background-color: #fef9c3; border-color: #fef08a; color: #854d0e; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .badge-green { background-color: #dcfce7; color: #166534; }
        .badge-red { background-color: #fee2e2; color: #991b1b; }
        table.data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table.data-table th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 12px; text-transform: uppercase; }
        table.data-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .total-row { background-color: #eff6ff; font-weight: bold; }
    </style>
</head>
<body>
    <div class="wrapper">
        <center>
            <table class="main">
                <tr><td class="header"><h1>${headerContent}</h1></td></tr>
                <tr><td class="body">${bodyContent}</td></tr>
                <tr><td class="footer">&copy; ${new Date().getFullYear()} ESchool ERP. All rights reserved.</td></tr>
            </table>
        </center>
    </div>
</body>
</html>
`;

// 1. Welcome Template
const welcomeTemplate = (name, role, schoolName) => {
    const isStudent = role === 'student';
    const statusText = isStudent ? "Pending Approval" : "Active";
    
    return baseLayout(
        `🎉 Welcome to ${schoolName || "ESchool ERP"}`,
        `
        <p>Hello <b>${name || "User"}</b>, your ${role || "account"} account has been created successfully.</p>
        <div class="info-box">
            <div class="info-item"><span class="info-label">Role:</span> ${role || "N/A"}</div>
            <div class="info-item"><span class="info-label">Status:</span> ${statusText}</div>
        </div>
        ${isStudent 
            ? `<p>Please complete your profile to proceed. The school administration will review and approve your account shortly.</p>`
            : `<p>You can now login and explore your dashboard to access all resources.</p>`
        }
        <center><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" class="btn">Go to Login</a></center>
        `
    );
};

// 2. Approval Template
const approvalTemplate = (name, srn, className, section, schoolName) => {
    return baseLayout(
        `✅ Account Approved!`,
        `
        <p>Dear <b>${name || "Student"}</b>,</p>
        <p>Congratulations! Your student account has been reviewed and approved by the administration.</p>
        <div class="alert-box alert-green">
            <div class="info-item"><span class="info-label">Student SRN:</span> ${srn || "N/A"}</div>
            <div class="info-item"><span class="info-label">Class:</span> ${className || "N/A"}</div>
            <div class="info-item"><span class="info-label">Section:</span> ${section || "N/A"}</div>
            <div class="info-item"><span class="info-label">Status:</span> Active</div>
        </div>
        <p>You now have full access to your student dashboard, including attendance, fees, and results.</p>
        <center><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" class="btn">Login to Dashboard</a></center>
        `,
        "#16a34a"
    );
};

// 3. Password Reset Template
const passwordResetTemplate = (name, resetUrl, schoolName) => {
    return baseLayout(
        `🔐 Password Reset Request`,
        `
        <p>Hello <b>${name || "User"}</b>,</p>
        <p>We received a request to reset your ${schoolName || "ESchool ERP"} password.</p>
        <center><a href="${resetUrl}" class="btn">Reset My Password</a></center>
        <div class="alert-box alert-yellow" style="margin-top: 32px;">
            <b>⚠️ Important:</b> This link will expire in 15 minutes. Please do not share this email with anyone else.
        </div>
        <p>If you did not request a password reset, you can safely ignore this email; your password will remains unchanged.</p>
        `
    );
};

// 4. Absence Alert Template
const absenceAlertTemplate = (studentName, date, subject, schoolName) => {
    return baseLayout(
        `⚠️ Absence Recorded`,
        `
        <p>Dear Parent/Guardian,</p>
        <p>This is to inform you that an absence has been recorded for your child today.</p>
        <div class="alert-box alert-red">
            <div class="info-item"><span class="info-label">Student:</span> ${studentName || "N/A"}</div>
            <div class="info-item"><span class="info-label">Date:</span> ${date || "N/A"}</div>
            <div class="info-item"><span class="info-label">Subject:</span> ${subject || "Daily Attendance"}</div>
        </div>
        <p>Regular attendance is critical for academic success. Please contact the school office if this absence was recorded in error or to provide a justification.</p>
        `,
        "#dc2626"
    );
};

// 5. Fee Assigned Template
const feeAssignedTemplate = (studentName, totalFee, breakdown, dueDate, schoolName) => {
    let rows = '';
    if (breakdown && Array.isArray(breakdown) && breakdown.length > 0) {
        breakdown.forEach(item => {
            rows += `<tr><td>${item.name || "Fee Entry"}</td><td style="text-align: right;">Rs. ${(item.amount || 0).toLocaleString()}</td></tr>`;
        });
    } else {
        rows = `<tr><td>Total Fee</td><td style="text-align: right;">Rs. ${(totalFee || 0).toLocaleString()}</td></tr>`;
    }

    return baseLayout(
        `💰 Fee Invoice Assigned`,
        `
        <p>Dear <b>${studentName || "Student"}</b>, a new fee invoice has been assigned to your account.</p>
        <table class="data-table">
            <thead><tr><th>Fee Component</th><th style="text-align: right;">Amount (Rs.)</th></tr></thead>
            <tbody>
                ${rows}
                <tr class="total-row"><td>TOTAL</td><td style="text-align: right;">Rs. ${(totalFee || 0).toLocaleString()}</td></tr>
            </tbody>
        </table>
        <div class="alert-box alert-yellow">
            📅 <b>Due Date:</b> ${dueDate || "N/A"}
        </div>
        <center><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" class="btn">View & Pay Online</a></center>
        `
    );
};

// 6. Fee Reminder Template
const feeReminderTemplate = (studentName, balance, dueDate, schoolName) => {
    return baseLayout(
        `🔔 Fee Payment Reminder`,
        `
        <p>Dear <b>${studentName || "Student"}</b>,</p>
        <p>This is a friendly reminder that you have an outstanding fee balance due shortly.</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; width: 30%; vertical-align: top;">
                <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold;">Balance Due</div>
                <div style="color: #dc2626; font-size: 18px; font-weight: bold;">Rs. ${balance || "0"}</div>
            </div>
            <div style="display: inline-block; width: 30%; vertical-align: top;">
                <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold;">Due Date</div>
                <div style="color: #d97706; font-size: 18px; font-weight: bold;">${dueDate || "N/A"}</div>
            </div>
            <div style="display: inline-block; width: 30%; vertical-align: top;">
                <div style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: bold;">Status</div>
                <div class="badge badge-red">PENDING</div>
            </div>
        </div>
        <p>Please complete your payment before the due date to ensure uninterrupted access to school services.</p>
        <center><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" class="btn">Pay Now</a></center>
        `,
        "#d97706"
    );
};

// 7. Leave Status Template
const leaveStatusTemplate = (studentName, leaveType, startDate, endDate, status, comment, schoolName) => {
    const isApproved = status === "Approved";
    const headerBg = isApproved ? "#16a34a" : "#dc2626";
    const badgeClass = isApproved ? "badge-green" : "badge-red";

    return baseLayout(
        isApproved ? "✅ Leave Approved" : "❌ Leave Rejected",
        `
        <p>Dear <b>${studentName || "Student"}</b>,</p>
        <p>Your leave request has been processed by the administration.</p>
        <div class="info-box">
            <div class="info-item"><span class="info-label">Leave Type:</span> ${leaveType || "N/A"}</div>
            <div class="info-item"><span class="info-label">From:</span> ${startDate || "N/A"}</div>
            <div class="info-item"><span class="info-label">To:</span> ${endDate || "N/A"}</div>
            <div class="info-item"><span class="info-label">Status:</span> <span class="badge ${badgeClass}">${status}</span></div>
        </div>
        ${comment ? `<div class="info-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0;"><span class="info-label">Reviewer Note:</span><br/>${comment}</div>` : ''}
        <p>${isApproved 
            ? "Your leave has been approved. Please ensure your assignments and coursework are kept up to date during your absence." 
            : "Unfortunately, your leave request was not approved at this time. Please contact your class teacher for further clarification."
        }</p>
        `,
        headerBg
    );
};

// 8. Exam Reminder Template
const examReminderTemplate = (studentName, examName, subject, examDate, totalMarks, schoolName) => {
    return baseLayout(
        `📝 Exam Reminder`,
        `
        <p>Dear <b>${studentName || "Student"}</b>, this is a reminder about your upcoming exam scheduled for tomorrow.</p>
        <div class="alert-box" style="background-color: #eff6ff; border-color: #bfdbfe; color: #1e40af;">
            <div class="info-item"><span class="info-label">Exam:</span> ${examName || "N/A"}</div>
            <div class="info-item"><span class="info-label">Subject:</span> ${subject || "N/A"}</div>
            <div class="info-item"><span class="info-label">Date:</span> ${examDate || "N/A"}</div>
            <div class="info-item"><span class="info-label">Max Marks:</span> ${totalMarks || "N/A"}</div>
        </div>
        <p><b>Quick Tips:</b></p>
        <ul style="padding-left: 20px; font-size: 14px;">
            <li>Get a good night's sleep tonight.</li>
            <li>Arrive at the examination hall at least 15 minutes early.</li>
            <li>Bring all required stationery (pens, pencils, etc.).</li>
        </ul>
        <p style="text-align: center; font-size: 18px;">Best of luck! 🌟</p>
        `
    );
};

// 9. General Notification Template
const generalNotificationTemplate = (userName, subject, message, schoolName) => {
    return baseLayout(
        subject,
        `
        <p>Dear <b>${userName || "User"}</b>,</p>
        <div class="info-box" style="background-color: #ffffff; border: 1px solid #e2e8f0;">
            <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p>Warm regards,<br/><b>${schoolName || "ESchool Administration"}</b></p>
        `,
        "#4338ca"
    );
};

module.exports = {
    welcomeTemplate,
    approvalTemplate,
    passwordResetTemplate,
    absenceAlertTemplate,
    feeAssignedTemplate,
    feeReminderTemplate,
    leaveStatusTemplate,
    examReminderTemplate,
    generalNotificationTemplate
};
