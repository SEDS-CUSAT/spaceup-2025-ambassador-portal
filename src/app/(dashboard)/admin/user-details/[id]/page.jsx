import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import AmbassadorDetail from "@/components/admin/ambassador-detail";

const CATEGORY_FIELDS = ["whatsapp_status", "instagram_story", "whatsapp_group"];

function serializeUploads(entries = []) {
  return entries.map((entry) => ({
    url: entry.url,
    public_id: entry.public_id,
    uploadedAt:
      entry.uploadedAt instanceof Date
        ? entry.uploadedAt.toISOString()
        : entry.uploadedAt ?? new Date().toISOString(),
    approval_status: entry.approval_status ?? "pending",
    points: typeof entry.points === "number" ? entry.points : 0,
  }));
}

function serializeAmbassador(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    college: doc.college,
    totalReferrals: doc.totalReferrals ?? 0,
    manualPoints: typeof doc.manualPoints === "number" ? doc.manualPoints : 0,
    uploads: CATEGORY_FIELDS.reduce((acc, field) => {
      acc[field] = serializeUploads(doc[field] || []);
      return acc;
    }, {}),
  };
}

export default async function AdminUserDetailPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const ambassadorId = params?.id;
  if (!ambassadorId || !Types.ObjectId.isValid(ambassadorId)) {
    redirect("/admin");
  }

  await connectDB();

  const ambassador = await Ambassador.findById(ambassadorId)
    .select(
      "name email phone college totalReferrals manualPoints whatsapp_status instagram_story whatsapp_group",
    )
    .lean();

  if (!ambassador) {
    redirect("/admin");
  }

  const serialized = serializeAmbassador(ambassador);

  return (
    <main className="mx-auto flex w-full max-w-screen flex-1 flex-col">
      <AmbassadorDetail member={serialized} />
    </main>
  );
}
