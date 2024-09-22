const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
  let transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let info = await transporter.sendMail({
    from: process.env.EMAIL_USER, // sender address
    to: process.env.COMPANY_EMAIL, // receiver's email
    subject: "Test Email from Yahoo", // Subject line
    text: "Hello, this is a test email from Yahoo!", // plain text body
  });

  console.log("Message sent: %s", info.messageId);
}

sendTestEmail().catch(console.error);
