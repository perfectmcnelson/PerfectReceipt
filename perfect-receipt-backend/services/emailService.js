const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email service is ready
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

/**
 * Send invoice email with PDF attachment
 * @param {Object} emailData
 * @returns {Promise<Object>} { success: true, messageId: "..." }
 */
const sendInvoiceEmail = async (emailData) => {
    try {
        const { recipientEmail, subject, message, attachments = [], userEmail, userName } = emailData;

        if (!recipientEmail || !subject) {
            throw new Error('Missing required fields: recipientEmail, subject');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            replyTo: userEmail,
            to: recipientEmail,
            subject: subject,
            text: message,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>${message.replace(/\n/g, '</p><p>')}</p>
                </div>
            `,
            attachments: attachments
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Invoice email sent to ${recipientEmail}`);
        return { success: true, messageId: result.messageId };
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
        const { recipientEmail, subject, message, attachments = [], userEmail, userName } = emailData;

        if (!recipientEmail || !subject) {
            throw new Error('Missing required fields: recipientEmail, subject');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            replyTo: userEmail,
            to: recipientEmail,
            subject: subject,
            text: message,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>${message.replace(/\n/g, '</p><p>')}</p>
                </div>
            `,
            attachments: attachments
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Receipt email sent to ${recipientEmail}`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Receipt email send error:', error);
        throw error;
    }
};

module.exports = {
    sendInvoiceEmail,
    sendReceiptEmail
};
