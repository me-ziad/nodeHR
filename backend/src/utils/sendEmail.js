const nodemailer = require('nodemailer');

async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,            // ✅ استخدم 587 بدل 465
    secure: false,        // ✅ خليها false مع 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Jobs App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

module.exports = sendEmail;