import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";

const SALT_ROUNDS = 10;

function buildReferralCode(seed = "") {
  const prefix = seed.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "AMB";
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${suffix}`;
}

async function generateUniqueReferralCode(name) {
  let attempts = 0;
  while (attempts < 6) {
    const candidate = buildReferralCode(name);
    const exists = await Ambassador.exists({ referralCode: candidate });
    if (!exists) {
      return candidate;
    }
    attempts += 1;
  }
  throw new Error("Unable to generate referral code");
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = payload?.name?.trim();
    const email = payload?.email?.toLowerCase().trim();
    const password = payload?.password;
    const college = payload?.college?.trim();
  const phone = payload?.phone?.trim();

    if (!name || !email || !password || !college || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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

    if (!/^[+\d][\d\s-]{7,}$/u.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid phone number" },
        { status: 422 },
      );
    }

    await connectDB();

    const existingAmbassador = await Ambassador.findOne({ email });
    if (existingAmbassador) {
      return NextResponse.json(
        { success: false, error: "Account already exists" },
        { status: 409 },
      );
    }

    const referralCode = await generateUniqueReferralCode(name);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const ambassador = await Ambassador.create({
      name,
      email,
      password: hashedPassword,
      college,
      phone,
      referralCode,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: ambassador._id.toString(),
          email: ambassador.email,
          name: ambassador.name,
          referralCode: ambassador.referralCode,
          totalReferrals: ambassador.totalReferrals ?? 0,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    const status = error instanceof Error && message === "Unable to generate referral code" ? 503 : 500;
    return NextResponse.json(
      { success: false, error: status === 503 ? "Please retry in a moment" : "Internal server error" },
      { status },
    );
  }
}
