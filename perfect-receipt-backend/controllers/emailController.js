const nodemailer = require('nodemailer');

// Email transporter configuration
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
    },
});

// Verify email service is ready
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

exports.sendEmail = async (req, res) => {

    try {
        const { name, email, subject, message } = req.body;

        if (!name) {
            throw new Error("Name doesn't exist ")
        }

        if (!email || !subject) {
            throw new Error("Missing required field: email, subject")
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            replyTo: email,
            to: process.env.EMAIL_USER,
            subject: subject,
            text: message,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>Hello, I'm ${name}!</p>
                    <br />
                    <p>${message.replace(/\n/g, '</p><p>')}</p>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Invoice email sent to ${process.env.EMAIL_USER}`);
        return res.json({ success: true, messageId: result.messageId });

    } catch (error) {
        console.error('❌ Email send error:', error);
        throw error;
    }
}