import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import Admin from "@/models/Admin";
import ResetToken from "@/models/ResetToken";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await ResetToken.deleteOne({ _id: resetToken._id });
      return NextResponse.json(
        { success: false, error: "Token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (resetToken.userModel === "Ambassador") {
      await Ambassador.findByIdAndUpdate(resetToken.userId, {
        password: hashedPassword,
      });
    } else if (resetToken.userModel === "Admin") {
      await Admin.findByIdAndUpdate(resetToken.userId, {
        password: hashedPassword,
      });
    } else {
        return NextResponse.json(
            { success: false, error: "Invalid user type" },
            { status: 400 }
        );
    }

    // Delete the used token
    await ResetToken.deleteOne({ _id: resetToken._id });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
