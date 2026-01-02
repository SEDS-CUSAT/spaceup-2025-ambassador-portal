import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import Admin from "@/models/Admin";
import ResetToken from "@/models/ResetToken";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    let user = await Ambassador.findOne({ email: normalizedEmail });
    let userModel = "Ambassador";

    if (!user) {
      user = await Admin.findOne({ email: normalizedEmail });
      userModel = "Admin";
    }

    // Always return success even if user not found to prevent enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Delete any existing reset tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token
    await ResetToken.create({
      userId: user._id,
      userModel,
      token,
      expiresAt,
    });

    // Send email
    const origin = req.headers?.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
