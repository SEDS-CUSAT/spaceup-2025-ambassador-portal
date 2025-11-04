import { NextResponse } from "next/server";
import { authenticateCredentials } from "@/lib/auth";

export async function POST(request) {
  try {
    const payload = await request.json();
    const email = payload?.email?.toLowerCase().trim();
    const password = payload?.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(email)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email address" },
        { status: 422 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 422 },
      );
    }

    const ambassador = await authenticateCredentials({ email, password });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: ambassador._id.toString(),
          email: ambassador.email,
          name: ambassador.name,
          referralCode: ambassador.referralCode,
          totalReferrals: ambassador.totalReferrals ?? 0,
          role: ambassador.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid credentials";
    const status = message === "Invalid credentials" ? 401 : 500;
    return NextResponse.json(
      {
        success: false,
        error: status === 500 ? "Internal server error" : "Invalid credentials",
      },
      { status },
    );
  }
}
