import { NextResponse } from "next/server";
import { Types } from "mongoose";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Ambassador from "@/models/Ambassador";

const CATEGORY_FIELDS = ["whatsapp_status", "instagram_story", "whatsapp_group"];

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

async function deleteFromCloudinary(publicId) {
  if (!publicId || !CLOUD_NAME || !API_KEY || !API_SECRET) {
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

  const body = new URLSearchParams();
  body.append("public_id", publicId);
  body.append("timestamp", timestamp);
  body.append("api_key", API_KEY);
  body.append("signature", signature);

  try {
    await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: "POST",
      body,
    });
  } catch (error) {
    // Swallow errors to avoid blocking user deletion when Cloudinary cleanup fails
  }
}

export async function DELETE(request, context) {
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

  await connectDB();
  const ambassador = await Ambassador.findById(ambassadorId);

  if (!ambassador) {
    return NextResponse.json({ success: false, error: "Ambassador not found" }, { status: 404 });
  }

  const publicIds = CATEGORY_FIELDS.flatMap((field) =>
    (ambassador[field] || []).map((entry) => entry?.public_id).filter(Boolean),
  );

  if (publicIds.length) {
    await Promise.allSettled(publicIds.map((id) => deleteFromCloudinary(id)));
  }

  await ambassador.deleteOne();

  return NextResponse.json({ success: true }, { status: 200 });
}
