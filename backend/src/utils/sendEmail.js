const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_USER || 'onboarding@resend.dev', // لازم يكون verified أو الافتراضي
      to,
      subject,
      html,
    });
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Resend error:", err);
    throw err;
  }
}

module.exports = sendEmail;