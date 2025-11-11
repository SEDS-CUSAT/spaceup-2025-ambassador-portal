import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET; // optional unsigned preset
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function randomHash(len = 6) {
  return crypto.randomBytes(Math.max(1, Math.ceil(len / 2))).toString("hex").slice(0, len);
}

export async function POST(request) {
  // Verify session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // validate cloudinary config
  if (!CLOUD_NAME) {
    return NextResponse.json({ success: false, error: "Cloudinary not configured" }, { status: 500 });
  }

  // parse form data
  const form = await request.formData();
  const file = form.get("file");
  const type = form.get("type");

  if (!file || typeof file === "string") {
    return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
  }

  const allowedTypes = ["whatsapp_status", "instagram_story", "whatsapp_group"];
  if (!type || !allowedTypes.includes(type)) {
    return NextResponse.json({ success: false, error: "Invalid upload type" }, { status: 400 });
  }

  const mime = file.type || "";
  if (!mime.startsWith("image/")) {
    return NextResponse.json({ success: false, error: "Only images allowed" }, { status: 422 });
  }

  const size = file.size ?? 0;
  const MAX = 5 * 1024 * 1024; // 5MB
  if (size > MAX) {
    return NextResponse.json({ success: false, error: "File too large (max 5MB)" }, { status: 413 });
  }

  try {
    // Prepare filename and folder
    const originalName = (form.get("originalName") || "upload").toString();
    const timestamp = Date.now();
    const hash = randomHash(8);
    const ext = (mime.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
    const uniqueFilename = `${originalName.replace(/\s+/g, "_")}_${timestamp}_${hash}`;
    const folder = `ambassador/${type}/${session.user.id}`;

    // Build form for Cloudinary
    const cloudUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("folder", folder);
    uploadForm.append("public_id", uniqueFilename);

    if (UPLOAD_PRESET) {
      // unsigned
      uploadForm.append("upload_preset", UPLOAD_PRESET);
    } else if (API_KEY && API_SECRET) {
      // signed: timestamp + signature
      const timestampStr = Math.floor(Date.now() / 1000).toString();
      // signature: sha1 of `folder=${folder}&public_id=${uniqueFilename}&timestamp=${timestamp}${api_secret}`
      const signatureBase = `folder=${folder}&public_id=${uniqueFilename}&timestamp=${timestampStr}${API_SECRET}`;
      const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");
      uploadForm.append("api_key", API_KEY);
      uploadForm.append("timestamp", timestampStr);
      uploadForm.append("signature", signature);
    } else {
      return NextResponse.json({ success: false, error: "Cloudinary credentials missing" }, { status: 500 });
    }

    const res = await fetch(cloudUrl, { method: "POST", body: uploadForm });
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ success: false, error: `Cloudinary upload failed: ${txt}` }, { status: 502 });
    }

    const body = await res.json();
    const secureUrl = body.secure_url || body.url;
    const publicId = body.public_id;

    // Persist in DB
    await connectDB();
    const pushObj = {
      url: secureUrl,
      public_id: publicId,
      uploadedAt: new Date(),
      approval_status: "pending",
      points: 0,
    };

    // use $push
    const updated = await Ambassador.findByIdAndUpdate(
      session.user.id,
      { $push: { [type]: pushObj } },
      { new: true },
    ).select(`${type}`);

    if (!updated) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          url: secureUrl,
          public_id: publicId,
          uploadedAt: pushObj.uploadedAt,
          approval_status: pushObj.approval_status,
          points: pushObj.points,
          type,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
