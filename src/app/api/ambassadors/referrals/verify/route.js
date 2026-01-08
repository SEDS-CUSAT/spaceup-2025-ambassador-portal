import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";

const API_KEY = process.env.API_KEY;

export async function POST(request) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: "Server configuration missing" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!bearerToken) {
    return NextResponse.json(
      { success: false, error: "Missing API key" },
      { status: 401 },
    );
  }

  if (bearerToken !== API_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch (parseError) {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const referralCodeInput = payload?.referralCode;

  if (!referralCodeInput) {
    return NextResponse.json(
      { success: false, error: "Referral code is required" },
      { status: 400 },
    );
  }

  const referralCode = referralCodeInput.toString().trim().toUpperCase();

  if (!referralCode) {
    return NextResponse.json(
      { success: false, error: "Provide a valid referral code" },
      { status: 400 },
    );
  }

  try {
    await connectDB();
  } catch (connectionError) {
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 },
    );
  }

  try {
    // Find without modification
    const ambassador = await Ambassador.findOne({ referralCode }).select(
      "referralCode name college",
    );

    if (!ambassador) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: "Referral code not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        data: {
          referralCode: ambassador.referralCode,
          name: ambassador.name,
          college: ambassador.college,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying referral code:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
