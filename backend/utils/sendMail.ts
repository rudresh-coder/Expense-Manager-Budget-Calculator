import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password, or paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });
    console.log(`[MAIL] Password reset email sent to ${to}`);
  } catch (err) {
    console.error(`[MAIL ERROR] Failed to send password reset email to ${to}:`, err);
    throw err; // propagate error to route handler
  }
}