import nodemailer from "nodemailer";

export default class EmailService {
    static transporter;
    static transporterConfig = {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SERVER_EMAIL,
            pass: process.env.SERVER_EMAIL_PASS,
        },
    }

    static init() {
        const config = EmailService.transporterConfig;
        if (!EmailService.transporter) {
            EmailService.transporter = nodemailer.createTransport(config);
        }

        return config;
    }

    static async sendEmail({ to, subject, text, html }) {
        if (!EmailService.transporter) EmailService.init();

        const mailOptions = {
            from: process.env.SERVER_EMAIL,
            to,
            subject,
            text,
            html,
        };

        try {
            const info = await EmailService.transporter.sendMail(mailOptions);
            console.log("Email sent:", info.messageId);
            return true;
        } catch (err) {
            console.error("Failed to send email:", err);
            return false;
        }
    }
}
