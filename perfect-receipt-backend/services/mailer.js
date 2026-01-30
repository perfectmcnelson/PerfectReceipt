// const nodemailer = require('nodemailer');
// const axios = require('axios');

// const isProduction = process.env.NODE_ENV === "production";

// /* =========================
//    SMTP (LOCAL ONLY)
// ========================= */
// let smtpTransporter = null;

// if (!isProduction) {
//   smtpTransporter = nodemailer.createTransport({
//     host: "smtp-relay.brevo.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.BREVO_SMTP_LOGIN,
//       pass: process.env.BREVO_SMTP_KEY,
//     },
//   });

//   smtpTransporter.verify((err) => {
//     if (err) {
//       console.error("❌ SMTP failed:", err.message);
//     } else {
//       console.log("✅ SMTP ready (local)");
//     }
//   });
// }

// /* =========================
//    BREVO HTTP API (PROD)
// ========================= */
// async function sendViaBrevoAPI({ to, subject, html, from, replyTo, attachments }) {
//   return axios.post(
//     "https://api.brevo.com/v3/smtp/email",
//     {
//       sender: {
//         email: from?.email || process.env.EMAIL_USER,
//         name: from?.name || "Perfect Receipt",
//       },
//       to: Array.isArray(to)
//         ? to.map((email) => ({ email }))
//         : [{ email: to }],
//       subject,
//       htmlContent: html,
//       replyTo: replyTo
//         ? { email: replyTo.email, name: replyTo.name || "" }
//         : undefined,
//       attachment: attachments?.map((file) => ({
//         name: file.name,
//         content: file.content, // base64 string
//       })),
//     },
//     {
//       headers: {
//         "api-key": process.env.BREVO_API_KEY,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// }

// /* =========================
//    UNIFIED SEND FUNCTION
// ========================= */
// async function sendMail({ to, subject, html, from, replyTo, attachments }) {
//   if (isProduction) {
//     // 🚀 Production → HTTP API
//     return sendViaBrevoAPI({ to, subject, html, from, replyTo, attachments });
//   }

//   // 🧪 Local → SMTP
//   return smtpTransporter.sendMail({
//     from: `"Perfect Receipt" <${from?.email || process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//     replyTo,
//     attachments: attachments.map(file => ({
//       filename: file.name,
//       content: Buffer.from(file.content, 'base64'),
//     }))
//   });
// }

// module.exports = {
//     sendMail,
// };

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
  const payload = {
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
  };

  // Add attachments if provided
  if (attachments && attachments.length > 0) {
    payload.attachment = attachments.map((file) => ({
      name: file.name,
      content: file.content, // Must be base64 string
    }));
  }

  console.log('📧 Sending email via Brevo API...');
  console.log('To:', payload.to);
  console.log('Subject:', payload.subject);
  console.log('Attachments:', payload.attachment?.length || 0);
  
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log('✅ Email sent successfully via Brevo API');
    return response;
  } catch (error) {
    console.error('❌ Brevo API Error:', error.response?.data || error.message);
    throw error;
  }
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
  const mailOptions = {
    from: `"${from?.name || 'Perfect Receipt'}" <${from?.email || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    replyTo: replyTo ? `"${replyTo.name || ''}" <${replyTo.email}>` : undefined,
  };

  // Add attachments for SMTP
  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments.map(file => ({
      filename: file.name,
      content: Buffer.from(file.content, 'base64'),
    }));
  }

  console.log('📧 Sending email via SMTP...');
  const result = await smtpTransporter.sendMail(mailOptions);
  console.log('✅ Email sent successfully via SMTP');
  return result;
}

module.exports = {
    sendMail,
};