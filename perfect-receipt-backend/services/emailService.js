const nodemailer = require('nodemailer');
const { sendMail } = require('./mailer');

// Email transporter configuration
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

// const transporter = nodemailer.createTransport({
//     host: "smtp-relay.brevo.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.BREVO_SMTP_USER,
//         pass: process.env.BREVO_SMTP_KEY,
//     },
// });



// Verify email service is ready
// transporter.verify((error, success) => {
//     if (error) {
//         console.error('❌ Email service error:', error);
//     } else {
//         console.log('✅ Email service ready');
//     }
// });

/**
 * Send invoice email with PDF attachment
 * @param {Object} emailData
 * @returns {Promise<Object>} { success: true, messageId: "..." }
 */
const sendInvoiceEmail = async (emailData) => {
    try {
        const { recipientEmail, subject, message, attachments = [], replyTo } = emailData;

        if (!recipientEmail || !subject) {
            throw new Error('Missing required fields: recipientEmail, subject');
        }

        const response = await sendMail({
            to: recipientEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>${message.replace(/\n/g, '</p><p>')}</p>
                </div>
            `,
            from: {
                email: process.env.EMAIL_USER,
                name: userName || 'Perfect Receipt'
            },
            replyTo: {
                email: replyTo?.email || process.env.EMAIL_USER,
                name: replyTo?.name || 'Perfect Receipt'
            },
            attachments: attachments
        });
        
        console.log(`✅ Invoice email sent to ${recipientEmail}`);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Invoice email send error:', error);
        throw error;
    }
};

/**
 * Send receipt email with PDF attachment
 * @param {Object} emailData
 * @returns {Promise<Object>} { success: true, messageId: "..." }
 */
const sendReceiptEmail = async (emailData) => {
    try {
        const { recipientEmail, subject, message, attachments = [], replyTo } = emailData;

        if (!recipientEmail || !subject) {
            throw new Error('Missing required fields: recipientEmail, subject');
        }

        const response = await sendMail({
            to: recipientEmail,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>${message.replace(/\n/g, '</p><p>')}</p>
                </div>
            `,
            from: {
                email: replyTo?.email || process.env.EMAIL_USER,
                name: replyTo?.name || 'Perfect Receipt'
            },
            replyTo,
            attachments,
        });

        console.log(`✅ Receipt email sent to ${recipientEmail}`);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Receipt email send error:', error);
        throw error;
    }
};

module.exports = {
    sendInvoiceEmail,
    sendReceiptEmail
};
