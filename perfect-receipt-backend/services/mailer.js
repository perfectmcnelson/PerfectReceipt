const nodemailer = require('nodemailer');
const axios = require('axios');

const isProduction = process.env.NODE_ENV === "production";

/* =========================
   SMTP (LOCAL ONLY)
========================= */
let smtpTransporter = null;

if (!isProduction) {
  smtpTransporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  smtpTransporter.verify((err) => {
    if (err) {
      console.error("❌ SMTP failed:", err.message);
    } else {
      console.log("✅ SMTP ready (local)");
    }
  });
}

/* =========================
   BREVO HTTP API (PROD)
========================= */
async function sendViaBrevoAPI({ to, subject, html, from, replyTo, attachments }) {
  return axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        email: from?.email || process.env.EMAIL_USER,
        name: from?.name || "Perfect Receipt",
      },
      to: Array.isArray(to)
        ? to.map((email) => ({ email }))
        : [{ email: to }],
      subject,
      htmlContent: html,
      replyTo: replyTo
        ? { email: replyTo.email, name: replyTo.name || "" }
        : undefined,
      attachment: attachments?.map((file) => ({
        name: file.name,
        content: file.content, // base64 string
      })),
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
}

/* =========================
   UNIFIED SEND FUNCTION
========================= */
async function sendMail({ to, subject, html, from, replyTo, attachments }) {
  if (isProduction) {
    // 🚀 Production → HTTP API
    return sendViaBrevoAPI({ to, subject, html, from, replyTo, attachments });
  }

  // 🧪 Local → SMTP
  return smtpTransporter.sendMail({
    from: `"Perfect Receipt" <${from?.email || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    replyTo,
    attachments: attachments.map(file => ({
      filename: file.name,
      content: Buffer.from(file.content, 'base64'),
    }))
  });
}

module.exports = {
    sendMail,
};