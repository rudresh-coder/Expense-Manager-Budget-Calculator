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
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Password Reset Request",
    html: `
      <p>Hello,</p>
      <p>You requested a password reset for your Expense Manager account.</p>
      <p>
        <b>How to reset your password:</b><br>
        1. Click <a href="${resetUrl}">this link</a> to open the reset page.<br>
        2. If the reset token is not pre-filled, copy it from the link above.<br>
        &nbsp;&nbsp;&nbsp;The token is the part after <b>token=</b> and before <b>&email=</b> in the link.<br>
        3. Paste your email and the token into the reset form, then choose a new password.
      </p>
      <p>
        <b>Example:</b><br>
        <code>${resetUrl}</code><br>
        In this link, <b>token</b> starts after <b>token=</b> and ends before <b>&email=</b>.
      </p>
      <p>
        <b>Important:</b><br>
        - This link will expire in 15 minutes.<br>
        - For security, you can only request a password reset a few times per hour.<br>
        - If you did not request this, you can ignore this email.
      </p>
      <p>
        If you have trouble, reply to this email for help.<br>
        <b>Expense Manager Team</b>
      </p>
    `,
  });
}