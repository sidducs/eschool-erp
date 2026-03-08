const cron = require('node-cron');
const StudentFee = require('../models/StudentFee');
const Settings = require('../models/SchoolSettings');
const { sendEmail } = require('../services/notificationService');
const { feeReminderTemplate } = require('../services/emailTemplates');

/**
 * Fee Reminder Job
 * Runs every day at 8:00 AM
 */
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running fee reminder job...');
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const dateStr = threeDaysFromNow.toISOString().split('T')[0];

    const fees = await StudentFee.find({
      status: { $ne: 'PAID' },
      dueDate: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lte: new Date(dateStr + 'T23:59:59.999Z')
      }
    }).populate('studentId', 'name email');

    const settings = await Settings.findOne();
    const schoolName = settings?.schoolName || 'ESchool ERP';

    for (const fee of fees) {
      if (!fee.studentId?.email) continue;
      
      const balance = fee.totalFee - fee.paidAmount;
      const dueDateStr = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A';
      
      try {
        await sendEmail(
          fee.studentId.email,
          `Fee Payment Due in 3 Days - ${schoolName}`,
          `Dear ${fee.studentId.name}, your fee payment of Rs.${balance} is due on ${dueDateStr}.`,
          feeReminderTemplate(fee.studentId.name, balance, dueDateStr, schoolName)
        );
        console.log(`[CRON] Fee reminder sent to ${fee.studentId.name}`);
      } catch (e) {
        console.error(`[CRON] Failed to send reminder to ${fee.studentId.name}:`, e.message);
      }
    }
  } catch (error) {
    console.error('[CRON] Fee reminder job error:', error.message);
  }
});
