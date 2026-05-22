require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function runTest() {
  console.log('Testing Email Connection...');
  console.log(`User: ${process.env.EMAIL_USER}`);
  console.log(`Pass Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'MISSING'}`);
  
  try {
    const valid = await transporter.verify();
    console.log('Connection verified! Sending test email...');
    
    const info = await transporter.sendMail({
      from: `"ESchool Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Diagnostic Email",
      text: "If you receive this, the email service is working perfectly.",
    });
    
    console.log('Test SUCCESS!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('\n--- TEST FAILED ---');
    console.error('Error Name:', error.name);
    console.error('Error Code:', error.code);
    console.error('Error Command:', error.command);
    console.error('Error Message:', error.message);
    if (error.response) console.error('Response:', error.response);
  }
}

runTest();
