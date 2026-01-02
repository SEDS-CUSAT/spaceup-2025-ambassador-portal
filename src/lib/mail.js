import nodemailer from "nodemailer";
import "dotenv/config";

export async function sendPasswordResetEmail(email, resetUrl) {
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error("Missing EMAIL_SERVER_USER or EMAIL_APP_PASSWORD environment variables. Please add them to your .env file.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
    to: email,
    subject: "SpaceUp Ambassador Portal - Password Reset",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0a0e27;">Reset Your Password</h2>
        <p>You requested a password reset for your SpaceUp Ambassador Portal account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #5b21b6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
