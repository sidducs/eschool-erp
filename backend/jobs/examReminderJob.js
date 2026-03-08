const cron = require('node-cron');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Settings = require('../models/SchoolSettings');
const { sendEmail } = require('../services/notificationService');
const { examReminderTemplate } = require('../services/emailTemplates');

/**
 * Exam Reminder Job
 * Runs every day at 7:00 PM
 */
cron.schedule('0 19 * * *', async () => {
  console.log('[CRON] Running exam reminder job...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const exams = await Exam.find({
      examDate: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lte: new Date(dateStr + 'T23:59:59.999Z')
      }
    });

    const settings = await Settings.findOne();
    const schoolName = settings?.schoolName || 'ESchool ERP';

    for (const exam of exams) {
      // Find all active students in the class
      const students = await User.find({ 
        role: 'student', 
        classId: exam.classId, 
        status: 'active' 
      }).select('name email');

      for (const student of students) {
        if (!student.email) continue;
        
        try {
          await sendEmail(
            student.email,
            `Exam Tomorrow: ${exam.subject} - ${schoolName}`,
            `Dear ${student.name}, this is a reminder that you have an exam for ${exam.subject} tomorrow.`,
            examReminderTemplate(student.name, exam.examName, exam.subject, dateStr, exam.totalMarks, schoolName)
          );
          console.log(`[CRON] Exam reminder sent to ${student.name} for ${exam.subject}`);
        } catch (e) {
          console.error(`[CRON] Failed to send exam reminder to ${student.name}:`, e.message);
        }
      }
    }
  } catch (error) {
    console.error('[CRON] Exam reminder job error:', error.message);
  }
});
