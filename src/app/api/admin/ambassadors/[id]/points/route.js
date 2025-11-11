import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Ambassador from "@/models/Ambassador";

const CATEGORY_FIELDS = ["whatsapp_status", "instagram_story", "whatsapp_group"];

function sanitizeNumber(input) {
  const value = typeof input === "string" ? Number(input) : input;
  if (!Number.isFinite(value)) {
    return null;
  }
  return value;
}

export async function PATCH(request, context) {
  const params = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const ambassadorId = params?.id;

  if (!ambassadorId || !Types.ObjectId.isValid(ambassadorId)) {
    return NextResponse.json({ success: false, error: "Invalid ambassador id" }, { status: 400 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  await connectDB();
  const ambassador = await Ambassador.findById(ambassadorId);

  if (!ambassador) {
    return NextResponse.json({ success: false, error: "Ambassador not found" }, { status: 404 });
  }

  const manualPoints = payload?.manualPoints;
  const parsedManual = manualPoints === undefined ? null : sanitizeNumber(manualPoints);

  if (manualPoints !== undefined && parsedManual === null) {
    return NextResponse.json({ success: false, error: "manualPoints must be a number" }, { status: 422 });
  }

  if (parsedManual !== null) {
    ambassador.manualPoints = parsedManual;
  }

  const imageUpdates = Array.isArray(payload?.imageUpdates) ? payload.imageUpdates : [];

  imageUpdates.forEach(({ type, public_id: publicId, points, approval_status: status }) => {
    if (!CATEGORY_FIELDS.includes(type) || !publicId) {
      return;
    }

    const categoryEntries = ambassador[type];
    const entry = categoryEntries.find((item) => item.public_id === publicId);

    if (!entry) {
      return;
    }

    const parsedPoints = sanitizeNumber(points);
    if (parsedPoints !== null) {
      entry.points = parsedPoints;
    }

    if (typeof status === "string" && ["pending", "verified", "rejected"].includes(status)) {
      entry.approval_status = status;
    }
  });

  await ambassador.save();

  const doc = ambassador.toObject({ virtuals: false });

  const responseData = {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    college: doc.college,
    referralCode: doc.referralCode,
    totalReferrals: doc.totalReferrals ?? 0,
    role: doc.role,
    manualPoints: doc.manualPoints ?? 0,
    uploads: CATEGORY_FIELDS.reduce((acc, field) => {
      acc[field] = (doc[field] || []).map((item) => ({
        url: item.url,
        public_id: item.public_id,
        uploadedAt: item.uploadedAt instanceof Date ? item.uploadedAt.toISOString() : item.uploadedAt,
        approval_status: item.approval_status ?? "pending",
        points: typeof item.points === "number" ? item.points : 0,
      }));
      return acc;
    }, {}),
  };

  return NextResponse.json({ success: true, data: responseData }, { status: 200 });
}
