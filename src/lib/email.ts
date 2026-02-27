import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.BREVO_SMTP_LOGIN || "a134c8001@smtp-brevo.com",
        pass: process.env.BREVO_SMTP_KEY,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    if (!process.env.BREVO_SMTP_KEY) {
        console.warn("\n⚠️ BREVO_SMTP_KEY is not defined in environment variables. Email will not be sent.");
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Fll System" <noreply@fll.com.ly>', // Verified Sender address
            to, // List of receivers
            subject, // Subject line
            html, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}
